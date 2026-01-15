import { FiMenu } from 'react-icons/fi';
import AppLogo from '../app/AppLogo';
import DarkModeToggle from '../base/DarkModeToggle';
import ProfileMenu from '../utility/ProfileMenu';
import NavbarQuizAction from './NavbarQuizAction';
import { useSideBarStore } from '@/store/new-quiz/useSideBar';
import UserStack from '../ui/UserStack';

export interface CreateQuizNavBarProps {
    quizId: string;
}

export default function CreateQuizNavBar() {
    const { appearing, setAppearing } = useSideBarStore();

    return (
        <div className="w-full h-20 bg-light-base dark:bg-dark-alpha/30 flex items-center justify-between pl-12">
            <div className="px-4 flex items-center justify-between w-full">
                <div className="flex justify-center items-center gap-x-2">
                    <FiMenu
                        size={30}
                        className={`lg:hidden cursor-pointer `}
                        onClick={() => setAppearing(!appearing)}
                    />
                    <AppLogo />
                </div>
                <div className="flex items-center gap-x-5">
                    <UserStack />
                    <NavbarQuizAction />
                    <DarkModeToggle />
                    <ProfileMenu />
                </div>
            </div>
        </div>
    );
}
