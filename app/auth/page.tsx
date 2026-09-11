"use client"
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignUpModal from "@/components/SignupModal";

export default function AuthPage(){
    const [showSignUpModal, setShowSignUpModal] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const supabase = createClient();
    const {user, loading: authLoading} = useAuth();
    const router = useRouter()

    useEffect(()=> {
        if(user && !authLoading){
            router.push("/")
        }
    }, [user, authLoading, router])

    // This page's form is now sign-in only; sign-up lives entirely in the modal.
    async function handleSignIn(e: React.FormEvent){
        e.preventDefault();
        setLoading(true);
        setError("")

        try{
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error: any){
            setError(error.message);
         } finally {
            setLoading(false);
         }
    }

    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Duoqueue
                </h1>

                <div className="h-6 flex justify-center mb-2">
                    <p className="text-gray-500 dark:text-gray-900 text-sm font-medium tracking-wide border-r-2 border-transparent whitespace-nowrap animate-typewriter">
                        Find your player 2
                    </p>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                    Sign into your account
                </p>
            </div>
            <form className="space-y-6" onSubmit={handleSignIn}>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-fray-700 dark:text-gray-300"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                    Password
                    </label>
                    <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter your password"
                    />
                </div>

                {error && (
                    <div className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Sign In"}
                </button>
            </form>
            <div className="text-center">
                <button
                    onClick={() => setShowSignUpModal(true)}
                    className="text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 text-sm"
                >
                    Don't have an account? Sign up
                </button>
            </div>
        </div>

        <SignUpModal
            isOpen={showSignUpModal}
            onClose={() => setShowSignUpModal(false)}
            onSuccess={() => setShowSignUpModal(false)}
        />
    </div>
    );
}