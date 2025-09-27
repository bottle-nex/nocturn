'use client';
import HostLobbyFooter from './HostLobbyFooter';
import HostLobbyRenderer from './HostLobbyRenderer';

export default function HostLobbyScreen() {
    return (
        <div className="w-full h-full flex">
            <HostLobbyRenderer />
            <HostLobbyFooter />
        </div>
    );
}
