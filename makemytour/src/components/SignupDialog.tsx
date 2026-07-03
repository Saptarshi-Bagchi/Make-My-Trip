import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';

const SignupDialog = () => {
    const [isSignup, setIsSignup] = useState(true);
    const [firstName, setFirstName] = useState(""); 
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button className='' variant="default">
                    Sign Up
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isSignup ? "Create Account" : "Welcome Back"}
                    </DialogTitle>
                    <DialogDescription>
                        {isSignup ? "Join us to start booking your travels" : "Enter your credentials to access your account"}
                    </DialogDescription>
                </DialogHeader>
                <form>
                    {isSignup && (
                        <div>
                            <div>
                                <Label>
                                    First Name
                                </Label>
                            </div>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default SignupDialog