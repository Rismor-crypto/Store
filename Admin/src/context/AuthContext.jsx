// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../utils/supabase';


// Create Auth Context
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // Check for active session on mount
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Error checking session:", error);
                setAuthError(error.message);
            } else if (data && data.session) {
                setUser(data.session.user);
            }

            setLoading(false);
        };

        checkSession();

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null);
            }
        );

        // Clean up subscription
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    // Send magic link
    // Send magic link with admin check
    const sendMagicLink = async (email) => {
        setAuthError(null);
        try {
            // First check if email exists in admin table
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('email')
                .eq('email', email)
                .single();

            if (adminError && adminError.code !== 'PGRST116') {
                // Database error other than "not found"
                setAuthError(adminError.message);
                return { success: false, error: adminError.message };
            }

            if (!adminData) {
                // Email not found in admin table
                setAuthError('Unauthorized email. Only admin emails are allowed.');
                return { success: false, error: 'Unauthorized email. Only admin emails are allowed.' };
            }

            // If email exists in admin table, proceed with magic link
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: 'https://adminrusselco.vercel.app/auth/callback',
                },
            });

            if (error) {
                setAuthError(error.message);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        }
    };

    // Sign out
    const signOut = async () => {
        setAuthError(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                setAuthError(error.message);
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (error) {
            setAuthError(error.message);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        authError,
        sendMagicLink,
        signOut,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}