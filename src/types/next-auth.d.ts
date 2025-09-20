import 'next-auth';

declare module 'next-auth' {
  interface User {
    $id: string;
    id: string;
    email: string;
    name: string;
    type: string;
    arcadeCoins: number;
    firstName?: string;
    lastName?: string;
    linkedinProfile?: string;
    githubProfile?: string;
    username: string;
    image?: string;
    usernameLastUpdatedAt?: string;
  }

  interface Session {
    user: {
      $id: string;
      id: string;
      email: string;
      name: string;
      type: string;
      arcadeCoins: number;
      firstName?: string;
      lastName?: string;
      linkedinProfile?: string;
      githubProfile?: string;
      username: string;
      image?: string;
      usernameLastUpdatedAt?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    $id: string;
    id: string;
    type: string;
    arcadeCoins: number;
    firstName?: string;
    lastName?: string;
    linkedinProfile?: string;
    githubProfile?: string;
    username: string;
    usernameLastUpdatedAt?: string;
  }
}