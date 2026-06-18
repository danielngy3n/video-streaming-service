"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import SignIn from "./signin";
import { onAuthStateChangedHelper} from "../firebase/firebase";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import Upload from "./upload";


// closure is used here to avoid having to manage unsubscribing from the auth state listener

export default function Navbar() {
    // Init user state to null, which means not signed in
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    });

    return (
        <nav className={styles.nav}>
        <Link href="/">
            <Image width={90} height={20}
            src="/youtube-logo.svg" alt="YouTube Logo"/>
        </Link>
        {
            user && <Upload />
        }
        <SignIn user={user} />
        </nav>
    );
}