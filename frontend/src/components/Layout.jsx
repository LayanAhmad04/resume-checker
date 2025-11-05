import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div
            style={{
                display: "flex",
                width: "100vw",
                height: "100vh",
                overflow: "hidden", // Prevents scrollbars
                background: "#151515",
                color: "#e5e5e5",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <Navbar />

            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden", // Stop overflow from children
                    padding: "2rem",
                    boxSizing: "border-box",
                }}
            >
                {children}
            </main>
        </div>
    );
}
