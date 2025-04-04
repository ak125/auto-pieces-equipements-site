/**
 * Module de connexion réelle au protocole MCP
 */
class MCPConnector {
    constructor() {
        this.deviceConnected = false;
        this.deviceInfo = null;
        this.vehicleData = null;
        this.readInterval = null;
    }
    
    /**
     * Établit une connexion avec un appareil MCP via Bluetooth ou USB
     * @returns {Promise} Résultat de la connexion
     */
    async connect() {
        try {
            // Utiliser l'API Web Bluetooth pour les appareils MCP
            if (navigator.bluetooth) {
                const device = await navigator.bluetooth.requestDevice({
                    filters: [
                        { services: ['obd2_service'] },
                        { namePrefix: 'MCP-' }
                    ],
                    optionalServices: ['device_information']
                });
                
                console.log('Appareil MCP détecté:', device.name);
                
                const server = await device.gatt.connect();
                const service = await server.getPrimaryService('obd2_service');
                
                // Caractéristiques OBD2/MCP
                this.commandChar = await service.getCharacteristic('command_characteristic');
                this.responseChar = await service.getCharacteristic('response_characteristic');
                
                // Récupérer les informations sur l'appareil
                const deviceService = await server.getPrimaryService('device_information');
                const firmware = await deviceService.getCharacteristic('firmware_revision_string');
                const firmwareValue = await firmware.readValue();
                
                this.deviceInfo = {
                    name: device.name,
                    firmware: firmwareValue,
                    protocol: 'MCP v3.2',
                    connected: true
                };
                
                this.deviceConnected = true;
                return {
                    success: true,
                    deviceInfo: this.deviceInfo
                };
            } else {
                // Fallback pour les navigateurs sans Bluetooth - utiliser WebUSB
                if (navigator.usb) {
                    const device = await navigator.usb.requestDevice({
                        filters: [{ vendorId: 0x2341 }] // ID Arduino comme exemple
                    });
                    
                    await device.open();
                    // Configuration USB pour l'appareil MCP
                    await device.selectConfiguration(1);
                    await device.claimInterface(0);
                    
                    this.usbDevice = device;
                    this.deviceConnected = true;
                    this.deviceInfo = {
                        name: `USB MCP Scanner`,
                        protocol: 'MCP v3.0',
                        connected: true
                    };
                    
                    return {
                        success: true,
                        deviceInfo: this.deviceInfo
                    };
                } else {
                    throw new Error("Aucune interface compatible (Bluetooth/USB) n'est disponible");
                }
            }
        } catch (error) {
            console.error("Erreur de connexion MCP:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Envoie une commande MCP au véhicule
     * @param {string} command Commande MCP à envoyer
     * @returns {Promise} Résultat de la commande
     */
    async sendCommand(command) {
        if (!this.deviceConnected) {
            throw new Error("Appareil MCP non connecté");
        }
        
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(command);
            
            if (this.commandChar) {
                // Envoi via Bluetooth
                await this.commandChar.writeValue(data);
                
                // Attendre et lire la réponse
                const response = await this.responseChar.readValue();
                const decoder = new TextDecoder();
                return decoder.decode(response);
            } else if (this.usbDevice) {
                // Envoi via USB
                await this.usbDevice.transferOut(1, data);
                
                // Lire la réponse
                const result = await this.usbDevice.transferIn(1, 64);
                const decoder = new TextDecoder();
                return decoder.decode(result.data);
            }
        } catch (error) {
            console.error("Erreur d'envoi de commande MCP:", error);
            throw error;
        }
    }
    
    /**
     * Démarre la lecture des données en temps réel
     * @param {Function} callback Fonction appelée à chaque mise à jour
     */
    startRealtimeData(callback) {
        if (!this.deviceConnected) {
            throw new Error("Appareil MCP non connecté");
        }
        
        // Arrêter toute lecture en cours
        this.stopRealtimeData();
        
        // Lire les données toutes les 500ms
        this.readInterval = setInterval(async () => {
            try {
                // Lire les paramètres cruciaux du moteur
                const rpm = await this.sendCommand("01 0C"); // Régime moteur
                const temp = await this.sendCommand("01 05"); // Température moteur
                const load = await this.sendCommand("01 04"); // Charge moteur
                const speed = await this.sendCommand("01 0D"); // Vitesse
                
                // Parser les réponses
                const parsedData = {
                    rpm: this.parseRPM(rpm),
                    temperature: this.parseTemperature(temp),
                    engineLoad: this.parseEngineLoad(load),
                    speed: this.parseSpeed(speed),
                    timestamp: Date.now()
                };
                
                this.vehicleData = parsedData;
                
                // Appeler le callback avec les données
                if (typeof callback === 'function') {
                    callback(parsedData);
                }
            } catch (error) {
                console.error("Erreur de lecture de données MCP:", error);
                this.stopRealtimeData();
            }
        }, 500);
    }
    
    /**
     * Arrête la lecture des données en temps réel
     */
    stopRealtimeData() {
        if (this.readInterval) {
            clearInterval(this.readInterval);
            this.readInterval = null;
        }
    }
    
    /**
     * Lit les codes d'erreur du véhicule
     * @returns {Promise<Array>} Liste des codes d'erreur
     */
    async readDTCs() {
        if (!this.deviceConnected) {
            throw new Error("Appareil MCP non connecté");
        }
        
        try {
            const response = await this.sendCommand("03"); // Commande OBD standard pour les DTCs
            return this.parseDTCs(response);
        } catch (error) {
            console.error("Erreur de lecture des codes d'erreur:", error);
            throw error;
        }
    }
    
    /**
     * Se déconnecte de l'appareil MCP
     */
    async disconnect() {
        this.stopRealtimeData();
        
        if (this.deviceConnected) {
            try {
                if (this.usbDevice) {
                    await this.usbDevice.close();
                }
                
                this.deviceConnected = false;
                this.deviceInfo = null;
                this.vehicleData = null;
                
                return { success: true };
            } catch (error) {
                console.error("Erreur de déconnexion MCP:", error);
                return { success: false, error: error.message };
            }
        }
        
        return { success: true };
    }
    
    // Fonctions utilitaires pour parser les réponses
    parseRPM(data) {
        // Implémenter le parsing réel selon les spécifications MCP/OBD2
        // Exemple simplifié
        const bytes = data.split(' ');
        if (bytes.length >= 4) {
            const a = parseInt(bytes[2], 16);
            const b = parseInt(bytes[3], 16);
            return ((a * 256) + b) / 4;
        }
        return 0;
    }
    
    parseTemperature(data) {
        const bytes = data.split(' ');
        if (bytes.length >= 3) {
            const a = parseInt(bytes[2], 16);
            return a - 40; // Formule OBD standard
        }
        return 0;
    }
    
    parseEngineLoad(data) {
        const bytes = data.split(' ');
        if (bytes.length >= 3) {
            const a = parseInt(bytes[2], 16);
            return (a * 100) / 255; // Formule OBD standard
        }
        return 0;
    }
    
    parseSpeed(data) {
        const bytes = data.split(' ');
        if (bytes.length >= 3) {
            return parseInt(bytes[2], 16);
        }
        return 0;
    }
    
    parseDTCs(data) {
        // Parser les codes d'erreur selon la spécification OBD2
        const bytes = data.split(' ');
        const dtcs = [];
        
        // Ignorer les premiers octets (headers, etc.)
        for (let i = 2; i < bytes.length; i += 2) {
            if (i + 1 < bytes.length) {
                const firstByte = parseInt(bytes[i], 16);
                const secondByte = parseInt(bytes[i + 1], 16);
                
                if (firstByte === 0 && secondByte === 0) {
                    continue; // Pas de code d'erreur
                }
                
                // Déterminer le type de code
                let typeChar = '';
                switch (firstByte >> 6) {
                    case 0: typeChar = 'P'; break; // Powertrain
                    case 1: typeChar = 'C'; break; // Chassis
                    case 2: typeChar = 'B'; break; // Body
                    case 3: typeChar = 'U'; break; // Network
                }
                
                // Construire le code
                const dtcHigh = ((firstByte & 0x3F) << 8) + secondByte;
                const dtc = typeChar + dtcHigh.toString(16).padStart(4, '0').toUpperCase();
                
                dtcs.push(dtc);
            }
        }
        
        return dtcs;
    }
}

// Exporter le connecteur MCP
export default MCPConnector;