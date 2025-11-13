import { useNavigate } from "react-router-dom";

import { useEffect } from "react";

export const RedirectPage = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        navigate("/")
    }, [navigate]);

    return (
        <div></div>
    );
};
