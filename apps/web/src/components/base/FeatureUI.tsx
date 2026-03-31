// import React, {
//     forwardRef,
//     useCallback,
//     useEffect,
//     useRef,
//     useState,
//     type MouseEvent,
// } from "react"
// import {
//     AnimatePresence,
//     motion,
//     useMotionTemplate,
//     useMotionValue,
//     type MotionStyle,
//     type MotionValue,
//     type Variants,
// } from "framer-motion"
// import Image from "next/image"

// // Utility function for class names
// const cn = (...classes: (string | undefined | null | false)[]): string => {
//     return classes.filter(Boolean).join(' ')
// }

// const clsx = cn // alias for compatibility

// // Add custom CSS styles
// const styles = `
//   .animated-cards::before {
//     pointer-events: none;
//     position: absolute;
//     user-select: none;
//     border-radius: 1.5rem;
//     opacity: 0;
//     transition: opacity 0.3s;
//     background: radial-gradient(
//       1000px circle at var(--x) var(--y),
//       #ffcd03 0,
//       #ffcd03 10%,
//       #4f2b82 25%,
//       #4f2b82 35%,
//       rgba(255, 255, 255, 0) 50%,
//       transparent 80%
//     );
//     z-index: -1;
//     content: "";
//     inset: -1px;
//   }

//   .animated-cards:hover::before {
//     opacity: 1;
//   }
// `

// // Types
// type WrapperStyle = MotionStyle & {
//     "--x": MotionValue<string>
//     "--y": MotionValue<string>
// }

// interface CardProps {
//     title: string
//     description: string
//     bgClass?: string
// }

// interface ImageSet {
//     step1dark1?: string
//     step1dark2?: string
//     step1light1: string
//     step1light2: string
//     step2dark1?: string
//     step2dark2?: string
//     step2light1: string
//     step2light2: string
//     step3dark?: string
//     step3light: string
//     step4light: string
//     alt: string
// }

// interface FeatureCarouselProps extends CardProps {
//     step1img1Class?: string
//     step1img2Class?: string
//     step2img1Class?: string
//     step2img2Class?: string
//     step3imgClass?: string
//     step4imgClass?: string
//     image: ImageSet
// }

// interface StepImageProps {
//     src: string
//     alt: string
//     className?: string
//     style?: React.CSSProperties
//     width?: number
//     height?: number
// }

// interface Step {
//     id: string
//     name: string
//     title: string
//     description: string
// }

// // Constants
// const TOTAL_STEPS = 4

// const steps = [
//     {
//         id: "1",
//         name: "earn",
//         title: "Earn",
//         description: "Winner takes the staked prize pool.",
//     },
//     {
//         id: "2",
//         name: "compete",
//         title: "Compete",
//         description: "Battle in quiz rounds with lifelines.",
//     },
//     {
//         id: "3",
//         name: "spectate",
//         title: "Spectate",
//         description: "Watch live, cheer, and send power-ups.",
//     },
//     {
//         id: "4",
//         name: "stake",
//         title: "Stake",
//         description: "Connect wallet and stake tokens to join.",
//     },
// ] as const

// // Animation presets
// const ANIMATION_PRESETS = {
//     fadeInScale: {
//         initial: { opacity: 0, scale: 0.95 },
//         animate: { opacity: 1, scale: 1 },
//         exit: { opacity: 0, scale: 0.95 },
//         transition: {
//             type: "spring",
//             stiffness: 300,
//             damping: 25,
//             mass: 0.5,
//         },
//     },
//     slideInRight: {
//         initial: { opacity: 0, x: 20 },
//         animate: { opacity: 1, x: 0 },
//         exit: { opacity: 0, x: -20 },
//         transition: {
//             type: "spring",
//             stiffness: 300,
//             damping: 25,
//             mass: 0.5,
//         },
//     },
//     slideInLeft: {
//         initial: { opacity: 0, x: -20 },
//         animate: { opacity: 1, x: 0 },
//         exit: { opacity: 0, x: 20 },
//         transition: {
//             type: "spring",
//             stiffness: 300,
//             damping: 25,
//             mass: 0.5,
//         },
//     },
// } as const

// type AnimationPreset = keyof typeof ANIMATION_PRESETS

// interface AnimatedStepImageProps extends StepImageProps {
//     preset?: AnimationPreset
//     delay?: number
//     onAnimationComplete?: () => void
// }

// // Custom hook for managing cyclic transitions
// function useNumberCycler(
//     totalSteps: number = TOTAL_STEPS,
//     interval: number = 3000
// ) {
//     const [currentNumber, setCurrentNumber] = useState(0)
//     const [isManualInteraction, setIsManualInteraction] = useState(false)
//     const timerRef = useRef<NodeJS.Timeout | null>(null)

//     const setupTimer = useCallback(() => {
//         if (timerRef.current) {
//             clearTimeout(timerRef.current)
//         }

//         timerRef.current = setTimeout(() => {
//             setCurrentNumber((prev) => (prev + 1) % totalSteps)
//             setIsManualInteraction(false)
//             setupTimer()
//         }, interval)
//     }, [interval, totalSteps])

//     const increment = useCallback(() => {
//         setIsManualInteraction(true)
//         setCurrentNumber((prev) => (prev + 1) % totalSteps)
//         setupTimer()
//     }, [totalSteps, setupTimer])

//     useEffect(() => {
//         setupTimer()
//         return () => {
//             if (timerRef.current) {
//                 clearTimeout(timerRef.current)
//             }
//         }
//     }, [setupTimer])

//     return {
//         currentNumber,
//         increment,
//         isManualInteraction,
//     }
// }

// function useIsMobile() {
//     const [isMobile, setIsMobile] = useState(false)

//     useEffect(() => {
//         const checkMobile = () => {
//             const isSmall = window.matchMedia("(max-width: 768px)").matches
//             setIsMobile(isSmall)
//         }

//         checkMobile()
//         window.addEventListener('resize', checkMobile)

//         return () => window.removeEventListener('resize', checkMobile)
//     }, [])

//     return isMobile
// }

// // Components
// function IconCheck({ className, ...props }: React.ComponentProps<"svg">) {
//     return (
//         <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 256 256"
//             fill="currentColor"
//             className={cn("h-4 w-4", className)}
//             {...props}
//         >
//             <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
//         </svg>
//     )
// }

// const stepVariants: Variants = {
//     inactive: {
//         scale: 0.8,
//         opacity: 0.5,
//     },
//     active: {
//         scale: 1,
//         opacity: 1,
//     },
// }

// const StepImage = forwardRef<
//     HTMLImageElement,
//     StepImageProps & { [key: string]: any }
// >(
//     (
//         { src, alt, className, style, width = 1200, height = 630, ...props },
//         ref
//     ) => {
//         return (
//             <Image
//                 unoptimized
//                 ref={ref}
//                 alt={alt}
//                 className={className}
//                 src={src}
//                 width={width}
//                 height={height}
//                 style={{
//                     position: "absolute",
//                     userSelect: "none",
//                     maxWidth: "unset",
//                     objectFit: "cover",
//                     ...style,
//                 }}
//                 {...props}
//             />
//         )
//     }
// )
// StepImage.displayName = "StepImage"

// const MotionStepImage = motion(StepImage)

// const AnimatedStepImage = ({
//     preset = "fadeInScale",
//     delay = 0,
//     onAnimationComplete,
//     ...props
// }: AnimatedStepImageProps) => {
//     const presetConfig = ANIMATION_PRESETS[preset]
//     return (
//         <MotionStepImage
//             {...props}
//             {...presetConfig}
//             transition={{
//                 ...presetConfig.transition,
//                 delay,
//             }}
//             onAnimationComplete={onAnimationComplete}
//         />
//     )
// }

// function FeatureCard({
//     bgClass,
//     children,
//     step,
// }: CardProps & {
//     children: React.ReactNode
//     step: number
// }) {
//     const [mounted, setMounted] = useState(false)
//     const mouseX = useMotionValue(0)
//     const mouseY = useMotionValue(0)
//     const isMobile = useIsMobile()

//     function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
//         if (isMobile) return
//         const { left, top } = currentTarget.getBoundingClientRect()
//         mouseX.set(clientX - left)
//         mouseY.set(clientY - top)
//     }

//     useEffect(() => {
//         setMounted(true)
//     }, [])

//     return (
//         <motion.div
//             className="animated-cards relative w-full rounded-2xl"
//             onMouseMove={handleMouseMove}
//             style={
//                 {
//                     "--x": useMotionTemplate`${mouseX}px`,
//                     "--y": useMotionTemplate`${mouseY}px`,
//                 } as WrapperStyle
//             }
//         >
//             <div
//                 className={clsx(
//                     "group relative w-full overflow-hidden rounded-3xl border border-black/10 bg-linear-to-b from-gray-900/90 to-gray-800 transition duration-300",
//                     "md:hover:border-transparent",
//                     bgClass
//                 )}
//             >
//                 <div className="m-7 min-h-[400px] w-full">
//                     <AnimatePresence mode="wait">
//                         <motion.div
//                             key={step}
//                             className="flex w-4/6 flex-col gap-3"
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: -20 }}
//                             transition={{
//                                 duration: 0.3,
//                                 ease: [0.23, 1, 0.32, 1],
//                             }}
//                         >
//                             <motion.h2
//                                 className="text-xl font-bold tracking-tight text-white md:text-2xl"
//                                 initial={{ opacity: 0, x: -20 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 transition={{
//                                     delay: 0.1,
//                                     duration: 0.3,
//                                     ease: [0.23, 1, 0.32, 1],
//                                 }}
//                             >
//                                 {steps[step]?.title}
//                             </motion.h2>
//                             <motion.div
//                                 initial={{ opacity: 0, x: -20 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 transition={{
//                                     delay: 0.2,
//                                     duration: 0.3,
//                                     ease: [0.23, 1, 0.32, 1],
//                                 }}
//                             >
//                                 <p className="text-sm leading-5 text-gray-300 sm:text-base sm:leading-5">
//                                     {steps[step]?.description}
//                                 </p>
//                             </motion.div>
//                         </motion.div>
//                     </AnimatePresence>
//                     {mounted ? children : null}
//                 </div>
//             </div>
//         </motion.div>
//     )
// }

// function Steps({
//     steps,
//     current,
//     onChange,
// }: {
//     steps: readonly Step[]
//     current: number
//     onChange: (index: number) => void
// }) {
//     return (
//         <nav aria-label="Progress" className="flex justify-center px-4">
//             <ol
//                 className="flex w-full flex-wrap items-start justify-start gap-2 sm:justify-center md:w-10/12 md:divide-y-0"
//                 role="list"
//             >
//                 {steps.map((step, stepIdx) => {
//                     const isCompleted = current > stepIdx
//                     const isCurrent = current === stepIdx
//                     const isFuture = !isCompleted && !isCurrent

//                     return (
//                         <motion.li
//                             key={`${step.name}-${stepIdx}`}
//                             initial="inactive"
//                             animate={isCurrent ? "active" : "inactive"}
//                             variants={stepVariants}
//                             transition={{ duration: 0.3 }}
//                             className={cn(
//                                 "relative z-50 rounded-full px-3 py-1 transition-all duration-300 ease-in-out md:flex",
//                                 isCompleted ? "bg-gray-500/20" : "bg-gray-500/10"
//                             )}
//                         >
//                             <div
//                                 className={cn(
//                                     "group flex w-full cursor-pointer items-center focus:outline-none focus-visible:ring-2",
//                                     (isFuture || isCurrent) && "pointer-events-none"
//                                 )}
//                                 onClick={() => onChange(stepIdx)}
//                             >
//                                 <span className="flex items-center gap-2 text-sm font-medium">
//                                     <motion.span
//                                         initial={false}
//                                         animate={{
//                                             scale: isCurrent ? 1.2 : 1,
//                                         }}
//                                         className={cn(
//                                             "flex h-4 w-4 shrink-0 items-center justify-center rounded-full duration-300",
//                                             isCompleted && "bg-green-400 text-white",
//                                             isCurrent && "bg-green-300/80 text-gray-400",
//                                             isFuture && "bg-green-300/10"
//                                         )}
//                                     >
//                                         {isCompleted ? (
//                                             <motion.div
//                                                 initial={{ scale: 0 }}
//                                                 animate={{ scale: 1 }}
//                                                 transition={{
//                                                     type: "spring",
//                                                     stiffness: 300,
//                                                     damping: 20,
//                                                 }}
//                                             >
//                                                 <IconCheck className="h-3 w-3 text-white" />
//                                             </motion.div>
//                                         ) : (
//                                             <span
//                                                 className={cn(
//                                                     "text-xs",
//                                                     !isCurrent && "text-lime-300"
//                                                 )}
//                                             >
//                                                 {stepIdx + 1}
//                                             </span>
//                                         )}
//                                     </motion.span>
//                                     <motion.span
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         className={clsx(
//                                             "text-sm font-medium duration-300",
//                                             isCompleted && "text-gray-400",
//                                             isCurrent && "text-lime-300",
//                                             isFuture && "text-gray-500"
//                                         )}
//                                     >
//                                         {step.name}
//                                     </motion.span>
//                                 </span>
//                             </div>
//                         </motion.li>
//                     )
//                 })}
//             </ol>
//         </nav>
//     )
// }

// const defaultClasses = {
//     step1img1:
//         "pointer-events-none w-[50%] border border-gray-100/10 transition-all duration-500 rounded-2xl",
//     step1img2:
//         "pointer-events-none w-[60%] border border-gray-100/10 transition-all duration-500 overflow-hidden rounded-2xl",
//     step2img1:
//         "pointer-events-none w-[50%] border border-gray-100/10 transition-all duration-500 rounded-2xl overflow-hidden",
//     step2img2:
//         "pointer-events-none w-[40%] border border-gray-100/10 transition-all duration-500 rounded-2xl overflow-hidden",
//     step3img:
//         "pointer-events-none w-[90%] border border-gray-100/10 rounded-2xl transition-all duration-500 overflow-hidden",
//     step4img:
//         "pointer-events-none w-[90%] border border-gray-100/10 rounded-2xl transition-all duration-500 overflow-hidden",
// } as const

// const defaultImage: ImageSet = {
//     step1light1: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
//     step1light2: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
//     step2light1: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
//     step2light2: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=600&h=400&fit=crop",
//     step3light: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
//     step4light: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
//     alt: "Feature showcase"
// }

// export function FeatureCarousel({
//     image = defaultImage,
//     step1img1Class = defaultClasses.step1img1,
//     step1img2Class = defaultClasses.step1img2,
//     step2img1Class = defaultClasses.step2img1,
//     step2img2Class = defaultClasses.step2img2,
//     step3imgClass = defaultClasses.step3img,
//     step4imgClass = defaultClasses.step4img,
//     title = "Feature Carousel",
//     description = "Interactive feature showcase",
//     ...props
// }: FeatureCarouselProps) {
//     const { currentNumber: step, increment } = useNumberCycler()
//     const [isAnimating, setIsAnimating] = useState(false)

//     const handleIncrement = () => {
//         if (isAnimating) return
//         setIsAnimating(true)
//         increment()
//     }

//     const handleAnimationComplete = () => {
//         setIsAnimating(false)
//     }

//     const renderStepContent = () => {
//         const content = () => {
//             switch (step) {
//                 case 0:
//                     return (
//                         <motion.div
//                             className="relative w-full h-full"
//                             onAnimationComplete={handleAnimationComplete}
//                         >
//                             <AnimatedStepImage
//                                 alt={image.alt}
//                                 className={clsx(step1img1Class)}
//                                 src={image.step1light1}
//                                 preset="slideInLeft"
//                             />
//                             <AnimatedStepImage
//                                 alt={image.alt}
//                                 className={clsx(step1img2Class)}
//                                 src={image.step1light2}
//                                 preset="slideInRight"
//                                 delay={0.1}
//                             />
//                         </motion.div>
//                     )
//                 case 1:
//                     return (
//                         <motion.div
//                             className="relative w-full h-full"
//                             onAnimationComplete={handleAnimationComplete}
//                         >
//                             <AnimatedStepImage
//                                 alt={image.alt}
//                                 className={clsx(step2img1Class, "rounded-2xl")}
//                                 src={image.step2light1}
//                                 preset="fadeInScale"
//                             />
//                             <AnimatedStepImage
//                                 alt={image.alt}
//                                 className={clsx(step2img2Class, "rounded-2xl")}
//                                 src={image.step2light2}
//                                 preset="fadeInScale"
//                                 delay={0.1}
//                             />
//                         </motion.div>
//                     )
//                 case 2:
//                     return (
//                         <AnimatedStepImage
//                             alt={image.alt}
//                             className={clsx(step3imgClass, "rounded-2xl")}
//                             src={image.step3light}
//                             preset="fadeInScale"
//                             onAnimationComplete={handleAnimationComplete}
//                         />
//                     )
//                 case 3:
//                     return (
//                         <motion.div
//                             className={clsx(
//                                 "absolute left-2/4 top-1/3 flex w-[100%] -translate-x-1/2 -translate-y-[33%] flex-col gap-12 text-center text-2xl font-bold md:w-[60%]"
//                             )}
//                             {...ANIMATION_PRESETS.fadeInScale}
//                             onAnimationComplete={handleAnimationComplete}
//                         >
//                             <AnimatedStepImage
//                                 alt={image.alt}
//                                 className="pointer-events-none top-[50%] w-[90%] overflow-hidden rounded-2xl border border-gray-100/10 md:left-[35px] md:top-[30%] md:w-full"
//                                 src={image.step4light}
//                                 preset="fadeInScale"
//                                 delay={0.1}
//                             />
//                         </motion.div>
//                     )
//                 default:
//                     return null
//             }
//         }

//         return (
//             <AnimatePresence mode="wait">
//                 <motion.div
//                     key={step}
//                     {...ANIMATION_PRESETS.fadeInScale}
//                     className="w-full h-full absolute"
//                 >
//                     {content()}
//                 </motion.div>
//             </AnimatePresence>
//         )
//     }

//     return (
//         <div className="w-full max-w-4xl mx-auto p-4">
//             <style>{styles}</style>
//             <FeatureCard {...props} step={step} title={title} description={description}>
//                 {renderStepContent()}
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.2 }}
//                     className="absolute left-[12rem] top-5 z-50 h-full w-full cursor-pointer md:left-0"
//                 >
//                     <Steps current={step} onChange={() => { }} steps={steps} />
//                 </motion.div>
//                 <motion.div
//                     className="absolute right-0 top-0 z-50 h-full w-full cursor-pointer md:left-0"
//                     onClick={handleIncrement}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                 />
//             </FeatureCard>
//         </div>
//     )
// }

// export default FeatureCarousel
