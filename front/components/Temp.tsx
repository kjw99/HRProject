"use client";
import React from 'react'
import { useRouter } from "next/navigation";

export default function Temp() {
    const router = useRouter();

    setTimeout(() => {
        router.push("/login");
    }, 1000);

    return (
        <div>

        </div>
    )
}
