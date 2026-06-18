"use client";

import { Fragment } from 'react';
import { signInWithGoogle, signOut } from "../firebase/firebase";
import styles from './signin.module.css';
import { FirebaseError } from 'firebase/app';
import { User } from 'firebase/auth';

interface SignInProps {
    user: User | null;
}

export default function SignIn({ user }: SignInProps) {
    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            if (
                error instanceof FirebaseError &&
                ["auth/cancelled-popup-request", "auth/popup-closed-by-user"].includes(error.code)
            ) {
                return;
            }

            console.error("Error signing in with Google:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <Fragment>
            { user ?
                (
                    <button className={styles.signin} onClick={handleSignOut}>
                        Sign Out
                    </button>
                ) : (
                    <button className={styles.signin} onClick={handleSignIn}>
                        Sign In with Google
                    </button>
                )
            }
        </Fragment>
    )
}
