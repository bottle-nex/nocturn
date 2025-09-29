// import AppLogo from '@/components/app/AppLogo';
// import { cn } from '@/lib/utils';
// import { FaGithub } from 'react-icons/fa';
// import { FaXTwitter } from 'react-icons/fa6';
// import DeveloperCard from '../founders/DeveloperCard';

// const animations = `
//   @keyframes fadeInLight {
//     0% { opacity: 0; filter: blur(100px); }
//     100% { opacity: 1; filter: blur(80px); }
//   }
//   @keyframes slideDownFade {
//     0% { opacity: 0; transform: translateY(-20px); }
//     100% { opacity: 1; transform: translateY(0); }
//   }
//   @keyframes fadeUp {
//     0% { opacity: 0; transform: translateY(30px); }
//     100% { opacity: 1; transform: translateY(0); }
//   }
// `;

// export default function FounderBase() {
//     return (
//         <div className="relative w-full min-h-screen flex flex-col items-center text-white overflow-y-auto bg-[#101214] select-none custom-scrollbar overflow-x-hidden">
//             <style>{animations}</style>
//             <div
//                 className="absolute top-0 left-0 w-[400vw] h-[120vh] pointer-events-none"
//                 style={{
//                     background:
//                         'linear-gradient(135deg, rgba(149,115,225,0.3) 0%, rgba(149,115,225,0) 60%)',
//                     filter: 'blur(80px)',
//                     transform: 'rotate(-20deg) translate(-40%, -40%)',
//                     transformOrigin: 'top left',
//                     animation: 'fadeInLight 1.8s ease-out forwards',
//                 }}
//             />
//             <div
//                 className="absolute h-full w-full max-h-[80px] border-b flex justify-start items-center px-3 sm:px-5"
//                 style={{ animation: 'slideDownFade 1s ease-out forwards' }}
//             >
//                 <AppLogo />
//             </div>
//             <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-5xl h-screen border-l border-r pt-[80px] flex flex-col mx-auto px-2 sm:px-0">
//                 <div
//                     className="h-16 sm:h-20 w-full border-b flex p-3 sm:p-6 text-sm sm:text-md items-center justify-between font-light"
//                     style={{ animation: 'slideDownFade 1.2s ease-out forwards' }}
//                 >
//                     <div className="text-xs sm:text-sm md:text-base">MEET THE FOUNDERS</div>
//                     <div className="flex gap-x-0.5">
//                         <span
//                             className={cn(
//                                 'social-item flex justify-center items-center',
//                                 'h-8 w-8 sm:h-9 sm:w-9 rounded-[12px] font-sans transition duration-200',
//                             )}
//                         >
//                             <FaXTwitter className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
//                         </span>
//                         <span
//                             className={cn(
//                                 'social-item flex justify-center items-center',
//                                 'h-8 w-8 sm:h-9 sm:w-9 rounded-[12px] font-sans transition duration-200',
//                             )}
//                         >
//                             <FaGithub className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
//                         </span>
//                     </div>
//                 </div>
//                 <DeveloperCard
//                     name="Rishi Kant"
//                     role="FullStack Developer"
//                     image="/images/founders/rishi.jpg"
//                     twitterUrl="https://x.com/khairrishi"
//                     linkedinUrl="https://www.linkedin.com/in/kant-linked/"
//                     githubUrl="https://github.com/kant-github"
//                     githubUsername="kant-github"
//                 />
//                 <DeveloperCard
//                     name="Anjan Suman"
//                     role="FullStack Developer"
//                     image="/images/founders/anjan.jpg"
//                     twitterUrl="https://x.com/AnjanSuman8"
//                     linkedinUrl="https://www.linkedin.com/in/anjansuman/"
//                     githubUrl="https://github.com/Anjansuman"
//                     githubUsername="Anjansuman"
//                 />
//                 <DeveloperCard
//                     name="Piyush Raj"
//                     role="FullStack Developer"
//                     image="/images/founders/piyush.jpg"
//                     twitterUrl="https://x.com/PiyushC2P"
//                     linkedinUrl="https://www.linkedin.com/in/piyush-raj-07a318260/"
//                     githubUrl="https://github.com/piyush-rj"
//                     githubUsername="piyush-rj"
//                 />
//                 <DeveloperCard
//                     name="Dipanshu Raj"
//                     role="FullStack Developer"
//                     image="/images/founders/dipanshu.jpg"
//                     twitterUrl="https://x.com/DipTheBeginner"
//                     linkedinUrl="https://www.linkedin.com/in/dipthebeginner/"
//                     githubUrl="https://github.com/DipTheBeginner"
//                     githubUsername="DipTheBeginner"
//                 />
//             </div>
//         </div>
//     );
// }
