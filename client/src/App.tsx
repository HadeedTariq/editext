import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import LoginUser from "./routes/auth/pages/LoginUser";
import RegisterUser from "./routes/auth/pages/RegisterUser";
import Home from "./routes/app/pages/Home";
import NavBar from "./components/Navbar";
import { useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authApi } from "./lib/axios";
import { setUser } from "./reducers/fullAppReducer";
import { useFullApp } from "./hooks/useFullApp";
import AuthProtector from "./routes/auth/components/AuthProtector";
import ProjectHandler from "./routes/app/components/ProjectHandler";
import ProjectPage from "./routes/app/pages/ProjectPage";
import CodeEditor from "./routes/app/components/CodeEditor";
import DefaultEditor from "./routes/app/pages/DefaultEditor";

function App() {
  const { theme } = useTheme();
  const { user } = useFullApp();
  const dispatch = useDispatch();
  const { mutate: authUser } = useMutation({
    mutationKey: ["authenticateUser"],
    mutationFn: async () => {
      const { data } = await authApi.get("/");
      dispatch(setUser(data));
    },
  });

  useEffect(() => {
    if (!user) {
      authUser();
    }
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <NavBar />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/auth",
          children: [
            {
              path: "login",
              element: (
                <AuthProtector>
                  <LoginUser />
                </AuthProtector>
              ),
            },
            {
              path: "register",
              element: (
                <AuthProtector>
                  <RegisterUser />
                </AuthProtector>
              ),
            },
          ],
        },
        {
          path: "/project",
          element: <ProjectHandler />,
        },
        {
          path: "/project/:id",
          element: <ProjectPage />,
          children: [
            {
              index: true,
              element: <DefaultEditor />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
