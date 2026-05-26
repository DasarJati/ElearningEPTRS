import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import RegisterForm from './Register';

const images = [
    "/images/swp.png",
    "/images/swp2.png",
    "/images/swp3.png",
];

export default function Login({ status, canResetPassword }) {
    const [isLogin, setIsLogin] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isLogin) {
            post(route('login'), { onFinish: () => reset('password') });
        } else {
            post(route('register'));
        }
    };

    const slides = [
        {
            title: "Welcome to DJATI",
            text: "DJATI helps developers to build organized and well-coded dashboards full of beautiful and rich modules. Join us and start building your application today.",
            footer: "More than 17k people joined us, it's your turn.",
        },
        {
            title: "Build Faster, Smarter",
            text: "Use our prebuilt templates and components to launch your product in record time. Save months of design and development.",
            footer: "Trusted by professionals worldwide.",
        },
        {
            title: "Collaborate Seamlessly",
            text: "Invite your team, assign roles, and manage your project effortlessly — all within one integrated platform.",
            footer: "Join thousands of teams using DJATI every day.",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title={isLogin ? "Sign in" : "Register"} />

            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
                {/* Left - Login form */}
                <div className="flex flex-col justify-center px-6 lg:px-16 py-12 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

                    <div className="max-w-md w-full mx-auto relative z-10">
                        {/* Logo area */}
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                {isLogin ? "Welcome Back!" : "Join the Club"}
                            </h1>
                            <p className="text-gray-600 text-sm font-medium">
                                {isLogin ? "Ready to continue your journey?" : "Start your adventure today"}
                            </p>
                        </div>

                        {/* Modern Toggle Switch */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg border border-gray-200/50 flex">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                                        isLogin
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-indigo-600"
                                    }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                                        !isLogin
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-indigo-600"
                                    }`}
                                >
                                    Register
                                </button>
                            </div>
                        </div>

                        {/* Form Container with Glassmorphism */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login" : "register"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8"
                            >
                                {isLogin ? (
                                    <form onSubmit={submit} className="space-y-5">
                                        <div className="group">
                                            <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-semibold text-sm mb-2" />
                                            <div className="relative">
                                                <TextInput
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={data.email}
                                                    className="mt-1 block w-full bg-gray-50/50 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-10"
                                                    onChange={(e) => setData("email", e.target.value)}
                                                    required
                                                    placeholder="student@university.edu"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </div>
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-semibold text-sm mb-2" />
                                            <div className="relative">
                                                <TextInput
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={data.password}
                                                    className="mt-1 block w-full bg-gray-50/50 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-10"
                                                    onChange={(e) => setData("password", e.target.value)}
                                                    required
                                                    placeholder="••••••••"
                                                />
                                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <InputError message={errors.password} className="mt-2" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center text-sm text-gray-600 cursor-pointer group">
                                                <Checkbox
                                                    name="remember"
                                                    checked={data.remember}
                                                    onChange={(e) => setData("remember", e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                                                />
                                                <span className="ml-2 group-hover:text-indigo-600 transition-colors">Remember me</span>
                                            </label>

                                            {canResetPassword && (
                                                <Link
                                                    href={route("password.request")}
                                                    className="text-sm font-semibold text-indigo-600 hover:text-purple-600 transition-colors"
                                                >
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>

                                        <PrimaryButton
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <>
                                                    Sign In
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </>
                                            )}
                                        </PrimaryButton>

                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-white/70 text-gray-500">Or continue with</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center space-x-4">
                                            {[
                                                { src: "https://www.svgrepo.com/show/475656/google-color.svg", alt: "Google" },
                                                { src: "https://www.svgrepo.com/show/475647/facebook-color.svg", alt: "Facebook" },
                                                { src: "https://www.svgrepo.com/show/475654/github-color.svg", alt: "GitHub" }
                                            ].map((social, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1 transition-all duration-200 group"
                                                >
                                                    <img src={social.src} alt={social.alt} className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="text-center text-sm text-gray-600 mt-6">
                                            Don't have an account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => setIsLogin(false)}
                                                className="font-bold text-indigo-600 hover:text-purple-600 transition-colors underline decoration-2 underline-offset-2"
                                            >
                                                Create one now
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <RegisterForm />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right - Image Slider with Modern Overlay */}
                <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
                    {/* Background Images with Ken Burns effect */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url(${images[currentSlide]})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                    </AnimatePresence>

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 max-w-lg px-12 text-white">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-medium">Live Community</span>
                            </div>

                            <h2 className="text-5xl font-bold mb-6 leading-tight">
                                {slides[currentSlide].title}
                            </h2>
                            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                                {slides[currentSlide].text}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mb-8">
                                <div>
                                    <div className="text-3xl font-bold text-white">17k+</div>
                                    <div className="text-sm text-gray-300">Active Students</div>
                                </div>
                                <div className="w-px h-12 bg-white/20" />
                                <div>
                                    <div className="text-3xl font-bold text-white">4.9</div>
                                    <div className="text-sm text-gray-300">App Rating</div>
                                </div>
                            </div>

                            {/* Testimonial Card */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex -space-x-3">
                                        {[1,2,3,4].map((i) => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        Join <span className="text-white font-semibold">2,000+</span> students today
                                    </div>
                                </div>
                                <p className="text-sm text-gray-200 italic">"{slides[currentSlide].footer}"</p>
                            </div>
                        </motion.div>

                        {/* Slide indicators */}
                        <div className="flex gap-2 mt-8">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Decorative floating elements */}
                    <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
                    <div className="absolute bottom-32 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
                </div>
            </div>

            {/* Add this to your CSS/tailwind config */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}