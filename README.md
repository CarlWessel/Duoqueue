# Duoqueue

Duoqueue is a gamer dating platform designed to help people connect through their shared love of video games. The goal is to make it easier for gamers to find potential romantic partners who share their interests, favourite games, and gaming preferences.

Rather than relying solely on traditional dating profiles, Duoqueue combines dating preferences with gaming interests to help users discover compatible people, connect with matches, and find their Player 2.

## Features

- **User Authentication:** Create an account and securely sign in.
- **Customizable Profiles:** Build a profile to represent yourself, your dating preferences, and your gaming interests.
- **Profile Discovery:** Browse potential matches based on compatibility and personal preferences.
- **Game-Based Matching:** Discover people who share your favourite games and gaming interests.
- **Matching System:** Connect with users based on dating preferences and shared interests.
- **Interactive Match Actions:** Interact with discovered profiles and manage matching activity.

## Tech Stack

- **Next.js** – Full stack web application framework.
- **React** – Component-based user interface development.
- **TypeScript** – Type-safe application development.
- **Tailwind CSS** – Responsive styling and UI design.
- **Supabase** – Backend services, PostgreSQL database, and authentication.
- **PostgreSQL** – Relational data storage for user profiles and matching information.
- **Git & GitHub** – Version control and source code management.
- **Vercel** – Web application deployment.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- A [Supabase](https://supabase.com/) account

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd my-app
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Configure your environment variables.

   Create a `.env.local` file in the project root and add the required Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Use the credentials associated with your Supabase project. Never commit private secrets to version control.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Goal

Duoqueue was built to explore full stack web development while creating a platform around the intersection of gaming and dating. The project combines frontend development, backend integration, database design, authentication, and matching logic into a single application.

The long-term goal is to create a space where gamers can find meaningful connections with people who share their interests, whether that means finding a romantic partner, a gaming companion, or their next Player 2.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Deployment

Duoqueue can be deployed using [Vercel](https://vercel.com/), which supports Next.js applications. Configure the required environment variables in your deployment settings before deploying.

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
