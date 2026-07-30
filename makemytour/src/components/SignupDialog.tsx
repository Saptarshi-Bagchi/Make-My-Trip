import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { signup, login } from '../api';
import { setUser } from '@/store';
import { useDispatch } from 'react-redux';
import { useTheme } from './ThemeContext';

interface SignupDialogProps {
    trigger: React.ReactNode;
}

const SignupDialog = ({ trigger }: SignupDialogProps) => {
    const [isSignup, setIsSignup] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [open, setopen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isSignup) {
                const signin = await signup(firstName, lastName, email, phoneNumber, password);
                dispatch(setUser(signin));
            } else {
                const data = await login(email, password);
                dispatch(setUser(data));
            }
            setopen(false);
            clearform();
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearform = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
    };

    const switchMode = (toSignup: boolean) => {
        setIsSignup(toSignup);
    };

    const systemFontStack = {
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    };

    return (
        <Dialog open={open} onOpenChange={setopen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent 
                style={systemFontStack}
                className={`sm:max-w-[425px] border shadow-2xl rounded-2xl p-6 transition-colors ${
                    isDark 
                        ? "bg-[#14211F] border-[#24413D] text-[#EAF2F0]" 
                        : "bg-white border-[#E3ECE9] text-[#1F3330]"
                }`}
            >
                <DialogHeader className="space-y-1.5">
                    <DialogTitle 
                        style={{ fontFamily: "'Fraunces', serif" }}
                        className={`text-2xl font-semibold tracking-tight ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}
                    >
                        {isSignup ? "Create Account" : "Welcome Back"}
                    </DialogTitle>
                    <DialogDescription className={`text-xs ${isDark ? "text-[#7FA39D]" : "text-gray-500"}`}>
                        {isSignup
                            ? "Join us to start booking your travels"
                            : "Enter your credentials to access your account"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuth} className="space-y-4 py-4" style={systemFontStack}>
                    {isSignup && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="firstname" className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-[#7FA39D]" : "text-gray-600"}`}>
                                    First Name
                                </Label>
                                <Input
                                    id="firstname"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    style={systemFontStack}
                                    className={`rounded-xl text-sm transition-colors ${
                                        isDark 
                                            ? "bg-[#1B2E2B] border-[#2C504D] text-[#EAF2F0] placeholder:text-[#5B7973] focus:border-[#7FD1C4]" 
                                            : "bg-white border-[#DCE7E4] text-[#1F3330] focus:border-[#3E6E6A]"
                                    }`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lastName" className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-[#7FA39D]" : "text-gray-600"}`}>
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    style={systemFontStack}
                                    className={`rounded-xl text-sm transition-colors ${
                                        isDark 
                                            ? "bg-[#1B2E2B] border-[#2C504D] text-[#EAF2F0] placeholder:text-[#5B7973] focus:border-[#7FD1C4]" 
                                            : "bg-white border-[#DCE7E4] text-[#1F3330] focus:border-[#3E6E6A]"
                                    }`}
                                />
                            </div>
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-[#7FA39D]" : "text-gray-600"}`}>
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={systemFontStack}
                            className={`rounded-xl text-sm transition-colors ${
                                isDark 
                                    ? "bg-[#1B2E2B] border-[#2C504D] text-[#EAF2F0] placeholder:text-[#5B7973] focus:border-[#7FD1C4]" 
                                    : "bg-white border-[#DCE7E4] text-[#1F3330] focus:border-[#3E6E6A]"
                            }`}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-[#7FA39D]" : "text-gray-600"}`}>
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={systemFontStack}
                            className={`rounded-xl text-sm transition-colors ${
                                isDark 
                                    ? "bg-[#1B2E2B] border-[#2C504D] text-[#EAF2F0] placeholder:text-[#5B7973] focus:border-[#7FD1C4]" 
                                    : "bg-white border-[#DCE7E4] text-[#1F3330] focus:border-[#3E6E6A]"
                            }`}
                        />
                    </div>
                    {isSignup && (
                        <div className="space-y-1.5">
                            <Label htmlFor="phoneNumber" className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-[#7FA39D]" : "text-gray-600"}`}>
                                Phone Number
                            </Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                style={systemFontStack}
                                className={`rounded-xl text-sm transition-colors ${
                                    isDark 
                                        ? "bg-[#1B2E2B] border-[#2C504D] text-[#EAF2F0] placeholder:text-[#5B7973] focus:border-[#7FD1C4]" 
                                        : "bg-white border-[#DCE7E4] text-[#1F3330] focus:border-[#3E6E6A]"
                                }`}
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        style={systemFontStack}
                        className="w-full bg-[#3E6E6A] text-white hover:bg-[#2C504D] rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-all mt-2"
                        variant="default"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? (isSignup ? "Signing up..." : "Logging in...")
                            : (isSignup ? "Sign Up" : "Login")}
                    </Button>
                </form>
                <div className={`text-center text-sm ${isDark ? "text-[#A7BFBA]" : "text-gray-600"}`}>
                    {isSignup ? (
                        <>
                            Already have an account?{" "}
                            <Button
                                variant="link"
                                style={systemFontStack}
                                className={`p-0 font-medium ${isDark ? "text-[#7FD1C4] hover:text-[#aef3e8]" : "text-[#3E6E6A]"}`}
                                onClick={() => switchMode(false)}
                            >
                                Login
                            </Button>
                        </>
                    ) : (
                        <>
                            Don't have an account?{" "}
                            <Button
                                variant="link"
                                style={systemFontStack}
                                className={`p-0 font-medium ${isDark ? "text-[#7FD1C4] hover:text-[#aef3e8]" : "text-[#3E6E6A]"}`}
                                onClick={() => switchMode(true)}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SignupDialog