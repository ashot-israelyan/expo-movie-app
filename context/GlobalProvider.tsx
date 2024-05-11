import { createContext, useContext, useState, useEffect, FC, ReactNode, Dispatch, SetStateAction } from "react";
import { getCurrentUser } from "@/lib/appwrite";
import { Models } from "react-native-appwrite/src";
import noop from "lodash/noop";

interface IGlobalContext {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: Models.Document | null;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setUser: Dispatch<SetStateAction<Models.Document | null>>;
}

const GlobalContext = createContext<IGlobalContext>({
  isLoading: true,
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: noop,
  setIsLoading: noop,
  setUser: noop,
});

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<Models.Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(res => {
        if (res) {
          setIsLoggedIn(true);
          setUser(res);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLoading,
        setIsLoading,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
