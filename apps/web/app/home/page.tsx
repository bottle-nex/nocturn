import DashBoard from '@/components/base/DashBoard';
import HomeTestNavbar from '@/components/navbars/HomeTestNavbar';

export default function Home() {
    return (
        <div className="h-screen w-full  bg-light-base dark:bg-[#171717]">
            <HomeTestNavbar />
            <DashBoard />
        </div>
    );
}
