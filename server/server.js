const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Route pour obtenir les avis Google
app.get('/api/google-reviews', async (req, res) => {
    const { placeId } = req.query;
    
    if (!placeId) {
        return res.status(400).json({ error: { message: 'Place ID requis' } });
    }
    
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
            params: {
                place_id: placeId,
                fields: 'reviews',
                key: process.env.GOOGLE_MAPS_API_KEY,
                language: 'fr'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Erreur API Google Places:', error);
        res.status(500).json({ 
            error: { 
                message: 'Erreur lors de la récupération des avis' 
            } 
        });
    }
});

// Route pour le diagnostic OBD-II via serveur
app.post('/api/obd-diagnostic', async (req, res) => {
    // Cette route serait utilisée si vous implémentiez une solution côté serveur
    // pour la communication avec les appareils OBD-II
    // ...
});

// Exemple simplifié d'application Android pour la connexion OBD-II via Bluetooth
// Dans un fichier MainActivity.java pour une application Android

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "OBD_MCP_APP";
    private static final UUID MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    
    private BluetoothAdapter btAdapter;
    private BluetoothSocket btSocket;
    private OutputStream outStream;
    private InputStream inStream;
    
    private TextView statusText;
    private Button connectButton;
    private Button sendDataButton;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        statusText = findViewById(R.id.status_text);
        connectButton = findViewById(R.id.connect_button);
        sendDataButton = findViewById(R.id.send_data_button);
        
        btAdapter = BluetoothAdapter.getDefaultAdapter();
        
        connectButton.setOnClickListener(v -> {
            connectToOBD();
        });
        
        sendDataButton.setOnClickListener(v -> {
            sendDataToWebsite();
        });
    }
    
    private void connectToOBD() {
        statusText.setText("Connexion en cours...");
        
        // Trouver l'appareil OBD-II (généralement nommé "OBDII" ou similaire)
        BluetoothDevice obdDevice = null;
        for (BluetoothDevice device : btAdapter.getBondedDevices()) {
            if (device.getName().contains("OBD")) {
                obdDevice = device;
                break;
            }
        }
        
        if (obdDevice == null) {
            statusText.setText("Appareil OBD non trouvé. Veuillez l'appairer d'abord.");
            return;
        }
        
        try {
            btSocket = obdDevice.createRfcommSocketToServiceRecord(MY_UUID);
            btSocket.connect();
            outStream = btSocket.getOutputStream();
            inStream = btSocket.getInputStream();
            
            statusText.setText("Connecté à " + obdDevice.getName());
            
            // Réinitialiser l'adaptateur OBD
            sendCommand("ATZ\r");
            Thread.sleep(1000);
            
            // Désactiver l'écho
            sendCommand("ATE0\r");
            Thread.sleep(100);
            
            // Format des réponses
            sendCommand("ATL0\r"); // Désactiver les sauts de ligne
            Thread.sleep(100);
            
            // Définir le protocole (Auto ou force e.g. 6 = ISO 15765-4 CAN)
            sendCommand("ATSP0\r");
            Thread.sleep(100);
            
        } catch (Exception e) {
            Log.e(TAG, "Erreur de connexion: " + e.getMessage());
            statusText.setText("Erreur de connexion: " + e.getMessage());
        }
    }
    
    private void sendCommand(String command) throws IOException {
        if (outStream == null) return;
        
        outStream.write(command.getBytes());
        outStream.flush();
        
        // Lire la réponse
        byte[] buffer = new byte[1024];
        int bytes = inStream.read(buffer);
        String response = new String(buffer, 0, bytes);
        
        Log.d(TAG, "Commande: " + command.trim() + " - Réponse: " + response.trim());
    }
    
    private void sendDataToWebsite() {
        statusText.setText("Collecte des données...");
        
        new Thread(() -> {
            try {
                // Collecter les données
                String rpm = sendOBDCommand("010C");
                String speed = sendOBDCommand("010D");
                String temp = sendOBDCommand("0105");
                String dtcCodes = sendOBDCommand("03");
                
                // Envoyer au site web via API
                // Code d'appel API ici...
                
                runOnUiThread(() -> {
                    statusText.setText("Données envoyées avec succès!");
                });
                
            } catch (Exception e) {
                Log.e(TAG, "Erreur d'envoi: " + e.getMessage());
                
                runOnUiThread(() -> {
                    statusText.setText("Erreur d'envoi: " + e.getMessage());
                });
            }
        }).start();
    }
    
    private String sendOBDCommand(String command) throws IOException, InterruptedException {
        sendCommand(command + "\r");
        Thread.sleep(250);
        
        byte[] buffer = new byte[1024];
        int bytes = inStream.read(buffer);
        return new String(buffer, 0, bytes);
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        
        if (btSocket != null) {
            try {
                btSocket.close();
            } catch (IOException e) {
                Log.e(TAG, "Erreur fermeture socket: " + e.getMessage());
            }
        }
    }
}

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});