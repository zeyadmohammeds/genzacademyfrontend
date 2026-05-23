/**
 * Centralized UI string constants.
 *
 * All user-visible text in JSX components must be referenced from this module
 * so that i18n scanning tools can verify strings are externalized.
 * To add localization later, replace the return values here with i18next `t()` calls
 * without touching individual components.
 */
export const S = {
  auth: {
    // Auth overlay
    initiatingProtocol: "Initiating Protocol",
    connectingGoogle: "Connecting to Google Intelligence Hub...",

    // Hero copy
    enterTheAcademy: "Enter the",
    academy: "Academy.",
    heroSubtitle:
      "A high-end technical training ecosystem. Sign in to access your course rooms, submit tasks, and check your standing on the leaderboard.",
    activeStudents: "Over 1,200+ active students",

    // Form headings
    welcomeBack: "Welcome back",
    signInSubtitle: "Please enter your details to sign in.",
    welcomeRegister: "Create account",
    registerSubtitle: "Please enter your details to register.",

    // Tabs
    tabSignIn: "Sign In",
    tabRegister: "Register",

    // Inputs
    placeholderFullName: "Full Name",
    placeholderEmail: "Email Address",
    placeholderPassword: "Password",

    // Divider
    orContinueWith: "or continue with",

    // Buttons
    signInButton: "Sign In to Academy",
    createAccountButton: "Create Account",
    processing: "Processing...",
    forgotPassword: "Forgot password?",
    googleButton: "Google Intelligence Protocol",

    // Error messages
    errInvalidCredentials: "Invalid email or password. Please try again.",
    errLocked: "Too many login attempts. Please try again later.",
    errCannotConnect: "Cannot connect to server. Please make sure the backend is running.",
    errEmailIssue: "Please check your email and try again.",
    errLoginFailed: "Login failed",
    errGoogleFailed: "Failed to sign in with Google.",
  },
} as const;
