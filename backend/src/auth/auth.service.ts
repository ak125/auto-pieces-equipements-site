import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
const PASSWORD_SALT = 10;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  public readonly checkIfUserExists = async ({
    email,
    password,
    withPassword,
  }: {
    email: string;
    withPassword: boolean;
    password: string;
  }) => {
    console.log('--- Début de checkIfUserExists ---');
    console.log('Email fourni :', email);
    console.log('Mot de passe fourni :', password);

    // Vérifie si l'utilisateur existe dans la base
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    console.log('Utilisateur trouvé :', existingUser);

    if (!existingUser) {
      console.log('Erreur : utilisateur introuvable.');
      return {
        message: "L'email est invalide",
        error: true,
      };
    }

    if (withPassword) {
      console.log('Validation du mot de passe activée.');
      console.log(
        'Mot de passe haché de l’utilisateur :',
        existingUser.password,
      );

      // Comparaison des mots de passe
      const isPasswordValid = await compare(
        password,
        existingUser.password || '',
      );
      console.log(
        'Résultat de la comparaison du mot de passe :',
        isPasswordValid,
      );

      if (!isPasswordValid) {
        console.log('Erreur : mot de passe invalide.');
        return {
          message: 'Le mot de passe est invalide',
          error: true,
        };
      }
    }

    console.log('Utilisateur validé avec succès.');
    return {
      message: "L'utilisateur existe.",
      error: false,
    };
  };

  public readonly createUser = async ({
    email,
    name,
    password,
  }: {
    email: string;
    name: string;
    password: string;
  }) => {
    const hashedPassword = await hash(password, PASSWORD_SALT);
    console.log(
      'Création de l’utilisateur avec un mot de passe haché :',
      hashedPassword,
    );
    return await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  };

  public readonly authenticateUser = async ({ email }: { email: string }) => {
    console.log('Authentification de l’utilisateur avec email :', email);
    return await this.prisma.session.create({
      data: {
        user: {
          connect: {
            email,
          },
        },
        sessionToken: createId(),
      },
      select: {
        sessionToken: true,
      },
    });
  };
}
