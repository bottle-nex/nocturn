import { cn } from '@/lib/utils';
// import SpectatorChatHeader from "../../../spectator-controls/chat/SpectatorChatHeader"
import { Message, User } from '../../../spectator-controls/specTypes';
import SpectatorMessageItem from '../../../spectator-controls/chat/SpectatorMessageItem';
// import SpectatorChatInput from "../../../spectator-controls/chat/SpectatorChatInput"
import ToolTipComponent from '../../../utility/TooltipComponent';
import { Button } from '../../../ui/button';
import { BiExpandAlt } from 'react-icons/bi';

type ExpandablePanel =
    | {
          type: 'chat';
          ref?: React.Ref<HTMLDivElement>;
          bottomRef: React.Ref<HTMLDivElement>;
          data: User;
          messages: Record<string, Message[]>;
          onSendMessage: (text: string) => void;
          selectedUser: User;
          onToggleExpand: () => void;
          isExpanded: boolean;
      }
    | {
          type: 'leaderboard';
          ref?: React.Ref<HTMLDivElement>;
          data: { title: string; svg: React.ReactNode };
          onToggleExpand: () => void;
          isExpanded: boolean;
      };

export default function ExpandablePanel(props: ExpandablePanel) {
    return (
        <div
            ref={props.ref}
            className={cn(
                'p-0 z-40 rounded-xl transition-all',
                'duration-300 ease-in-out',
                'border border-neutral-200 dark:border-neutral-700 bg-light-base dark:bg-neutral-900',
                'shadow-2xl',
                props.isExpanded
                    ? 'fixed right-0 rounded-r-none w-[32vw] max-w-[32vw] h-full border-r-0 border-t-0'
                    : 'absolute bottom-22 right-15 w-[26rem] h-[40rem] rounded-br-none',
            )}
        >
            <Body {...props} />
        </div>
    );
}

function Body(props: ExpandablePanel) {
    if (props.type === 'chat') {
        return (
            <div className="relative h-full flex flex-col pb-1">
                {/* <SpectatorChatHeader
                user={props.data}
                onToggleExpand={props.onToggleExpand}
            /> */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" data-lenis-prevent>
                    <div className="min-h-full flex flex-col justify-end">
                        {(props.messages[props.selectedUser.id] || []).map((message) => (
                            <SpectatorMessageItem
                                key={message.id}
                                message={message}
                                isUser={message.sender === 'user'}
                                avatarUrl={props.selectedUser.avatar}
                            />
                        ))}
                        <div ref={props.bottomRef} />
                    </div>
                </div>
                {/* <SpectatorChatInput onSendMessage={props.onSendMessage} /> */}
            </div>
        );
    }

    if (props.type === 'leaderboard') {
        return (
            <div className="relative h-full flex flex-col pb-1">
                <div className="flex justify-between items-center px-7 py-4 border-b">
                    <div className="flex items-center gap-x-3 text-dark-base dark:text-light-base ">
                        {props.data.svg}
                        <div className="text-base ">{props.data.title}</div>
                    </div>
                    <ToolTipComponent content="Click to expand">
                        <div>
                            <Button
                                className="text-dark-base dark:text-dark-base cursor-pointer dark:bg-neutral-600/30 "
                                variant={'ghost'}
                                onClick={props.onToggleExpand}
                            >
                                <BiExpandAlt className="dark:text-light-base" strokeWidth={0.5} />
                            </Button>
                        </div>
                    </ToolTipComponent>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" data-lenis-prevent></div>
            </div>
        );
    }

    return <div>Invalid type</div>;
}
