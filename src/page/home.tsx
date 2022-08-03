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
            <button onClick={toggleLogin}>{isLogin ? 'toggle On' : 'toggle Off'}</button>
            {
                isLogin ? (
                    <div>ON</div>
                ) : (
                    <div>OFF</div>
                )
            }
            <div style={{
                marginBottom: 20,
            }}></div>
        </>
    )
};

export default Home;