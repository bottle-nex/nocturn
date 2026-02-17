import { JSX } from 'react';
import { AiQuizChatRole, AiQuizMessage } from '@nocturn/types';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';
import SystemMessage from './SystemMessage';
// import SystemMessage from './SystemMessage';

interface BuilderMessageProps {
    message: AiQuizMessage;
    image: string;
    loading: boolean;
}

export default function Message({ message, image }: BuilderMessageProps): JSX.Element {
    return (
        <div className="w-full shrink-0 tracking-wide ">
            {message.role === AiQuizChatRole.USER && (
                <UserMessage
                    content={message.content}
                    createdAt={message.createdAt}
                    image={image}
                />
            )}

            {message.role === AiQuizChatRole.AGENT && (
                <AgentMessage content={message.content} createdAt={message.createdAt} />
            )}

            {message.role === AiQuizChatRole.SYSTEM && (
                <SystemMessage type={message.element!} content={message.content} />
            )}
        </div>
    );
}
