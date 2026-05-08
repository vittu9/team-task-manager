import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { isAdminRole } from "../../utils/role.utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [show, setShow] = useState(false);
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setApiError("");
    try {
      console.log('Login attempt with values:', values);
      const data = await loginApi(values);
      console.log('Login API Response:', data);
      console.log('Response structure check:');
      console.log('- data.user exists:', !!data.user);
      console.log('- data.accessToken exists:', !!data.accessToken);
      console.log('- data.refreshToken exists:', !!data.refreshToken);
      console.log('- User role:', data.user?.role);
      
      if (!data.user || !data.accessToken || !data.refreshToken) {
        console.error('Invalid response structure - missing required fields');
        setApiError("Invalid response from server");
        return;
      }
      
      console.log("LOGIN SUCCESS", {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
      
      login(
        data.user,
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        { rememberMe: values.rememberMe }
      );
      
      console.log("AUTH STORE STATE", useAuthStore.getState());
      
      toast.success("Login successful");
      const targetRoute = isAdminRole(data.user?.role) ? "/admin" : "/member/tasks";
      console.log('Login successful, navigating to:', targetRoute);
      console.log('🧭 About to call navigate() with route:', targetRoute);
      navigate(targetRoute);
      console.log('🧭 navigate() called');
      
      setTimeout(() => {
        console.log(
          "POST NAVIGATION AUTH STATE",
          useAuthStore.getState()
        );
      }, 1000);
    } catch (err) {
      console.log('Login Error:', err);
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);
      setApiError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="flex flex-col justify-center px-12 text-white relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">TM</span>
              </div>
              <span className="text-3xl font-bold">Task Manager</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome Back to
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                Your Workspace
              </span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              Streamline your workflow with powerful task management, team collaboration, and real-time analytics.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21A5,5 0 0,1 2,11.25A5,5 0 0,1 2.79,8.21L9,3.58A2,2 0 0,1 11.25,2H12.75A2,2 0 0,1 14.21,3.58L20.42,8.21A5,5 0 0,1 22,11.25C22,12.9 21.35,14.17 20.42,15.58L14.21,20.42A5,5 0 0,1 13.75,22A5,5 0 0,1 11.25,22C12.9,22 12,21.75 11.25,21.75L9,20.42Z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Secure Authentication</div>
                <div className="text-sm text-white/60">Enterprise-grade security for your data</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A6,6 0 0,1 6,12A6,6 0 0,1 12,18A6,6 0 0,1 12,6M12,8A4,4 0 0,1 8,12A4,4 0 0,1 12,16A4,4 0 0,1 12,8Z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Real-time Collaboration</div>
                <div className="text-sm text-white/60">Work together seamlessly with your team</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,19V10A2,2 0 0,0 7,8H5A2,2 0 0,0 3,10V19A2,2 0 0,0 5,21H7A2,2 0 0,0 9,19M13,5V19A2,2 0 0,0 15,21H17A2,2 0 0,0 19,19V5A2,2 0 0,0 17,3H15A2,2 0 0,0 13,5M21,9V19A2,2 0 0,0 19,21H17A2,2 0 0,0 19,19V9A2,2 0 0,0 17,7H19A2,2 0 0,0 21,9Z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Advanced Analytics</div>
                <div className="text-sm text-white/60">Track progress and performance metrics</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h1>
              <p className="text-slate-600">Welcome back! Please enter your details</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input 
                  {...register("email")} 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
                <p className="text-sm text-red-500 mt-1">{errors.email?.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    placeholder="Enter your password"
                    type={show ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShow((s) => !s)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-sm text-red-500 mt-1">{errors.password?.message}</p>
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{apiError}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" {...register("rememberMe")} className="rounded border-slate-300" />
                  Remember me
                </label>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
