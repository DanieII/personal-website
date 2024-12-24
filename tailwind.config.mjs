/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "selector",
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {
            colors: {
                "bg-color": "var(--bg-color)",
                "primary-color": "var(--primary-color)",
                "secondary-color": "var(--secondary-color)",
                "other-color": "var(--other-color)",
            },
        },
    },
    plugins: [],
};
