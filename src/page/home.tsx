import { useState } from "react";

interface Props {

}

const Home = ({}: Props) => {
    const [isLogin, setIsLogin] = useState<boolean>();

    const toggleLogin = () => {
        setIsLogin(!isLogin);
    }

    return (
        <>
            <button onClick={toggleLogin}>{isLogin ? 'logout' : 'login'}</button>
            {
                isLogin ? (
                    <div>Welcome~!</div>
                ) : (
                    <div>You need to login.</div>
                )
            }
        </>
    )
};

export default Home;