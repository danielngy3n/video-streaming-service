"use client";

import { Fragment } from 'react';
import { signInWithGoogle, signOut } from "../firebase/firebase";
import styles from './signin.module.css';
import { User } from 'firebase/auth/web-extension';

interface SignInProps {
    user: User | null;
}

export default function SignIn({ user }: SignInProps) {
    return (
        <Fragment>
            { user ?
                (
                    <button className={styles.signin} onClick={signOut}>
                        Sign Out
                    </button>
                ) : (
                    <button className={styles.signin} onClick={signInWithGoogle}>
                        Sign In with Google
                    </button>
                )
            }
        </Fragment>
    )
}
