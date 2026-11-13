// Some browsers expose requestFullscreen but disable it for document elements.
export function supportsFullscreen(document: {
    fullscreenEnabled?: boolean;
    documentElement: Partial<Pick<HTMLElement, 'requestFullscreen'>>;
}) {
    return (
        document.fullscreenEnabled === true &&
        typeof document.documentElement.requestFullscreen === 'function'
    );
}
