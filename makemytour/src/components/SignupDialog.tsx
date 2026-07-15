import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { signup, login } from '../api';
import { setUser } from '@/store';
import { useDispatch } from 'react-redux';

interface SignupDialogProps {
    trigger: React.ReactNode;
}

function extractErrorInfo(error: unknown): { status: number | null; text: string } {
    if (typeof error === "string") return { status: null, text: error };

    if (error && typeof error === "object") {
        const anyErr = error as any;
        const status: number | null =
            anyErr.response?.status ?? anyErr.status ?? null;

        const responseData = anyErr.response?.data;
        let text = "";
        if (responseData) {
            if (typeof responseData === "string") text = responseData;
            else if (responseData.message) text = responseData.message;
            else if (responseData.error) text = responseData.error;
        }
        if (!text && typeof anyErr.message === "string") {
            text = anyErr.message;
        }
        return { status, text };
    }

    return { status: null, text: "" };
}

function getLoginErrorMessage(error: unknown): string {
    const { status, text } = extractErrorInfo(error);
    const lower = text.toLowerCase();

    const accountNotFound =
        status === 404 ||
        lower.includes("not found") ||
        lower.includes("no account") ||
        lower.includes("does not exist") ||
        lower.includes("doesn't exist") ||
        lower.includes("no user");

    const wrongPassword =
        status === 401 ||
        lower.includes("password") ||
        lower.includes("invalid credential") ||
        lower.includes("incorrect");

    if (accountNotFound) {
        return "This email doesn't have an account. Please sign up first.";
    }
    if (wrongPassword) {
        return "Wrong password. Please try again.";
    }
    return text || "Couldn't log you in. Please try again.";
}

function getSignupErrorMessage(error: unknown): string {
    const { status, text } = extractErrorInfo(error);
    const lower = text.toLowerCase();

    const alreadyExists =
        status === 409 ||
        lower.includes("already exists") ||
        lower.includes("already registered") ||
        lower.includes("already in use");

    if (alreadyExists) {
        return "An account with this email already exists. Please login instead.";
    }
    return text || "Couldn't create your account. Please check your details and try again.";
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
            const message = isSignup
                ? getSignupErrorMessage(error)
                : getLoginErrorMessage(error);
            window.alert(message);
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

    return (
        <Dialog open={open} onOpenChange={setopen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {isSignup ? "Create Account" : "Welcome Back"}
                    </DialogTitle>
                    <DialogDescription>
                        {isSignup
                            ? "Join us to start booking your travels"
                            : "Enter your credentials to access your account"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuth} className="space-y-4 py-4">
                    {isSignup && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstname"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {isSignup && (
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white"
                        variant="default"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? (isSignup ? "Signing up..." : "Logging in...")
                            : (isSignup ? "Sign Up" : "Login")}
                    </Button>
                </form>
                <div className="text-center text-sm">
                    {isSignup ? (
                        <>
                            Already have an account?{" "}
                            <Button
                                variant="link"
                                className="p-0 text-blue-600"
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
                                className="p-0 text-blue-600"
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