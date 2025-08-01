export default function RandomNodeButton({
    onClick,
    getId,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    getId: (id: string) => void;
}) {
    const handleClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        const randomHex =
            "#" +
            Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, "0");

        onClick?.(e);
        getId(randomHex);
    };

    return (
        <div style={{ position: "absolute", left: "50px", bottom: "50px" }}>
            <button
                style={{ padding: "1rem" }}
                onClick={handleClick}
                {...props}
            >
                +
            </button>
        </div>
    );
}
