import { useSelector } from "react-redux"
import Banner from "../../Components/User/Banner"
import Contact from "../../Components/User/Contact"
import FeatureSection from "../../Components/User/FeatureSection"
import Footer from "../../Components/User/Footer"
import FreqAskedQuestions from "../../Components/User/FreqAskedQuestions"
import Reviews from "../../Components/User/Reveiws"
import { RootState } from "../../redux/store"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (currentUser && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  return (
    <div>
    <Banner />
    <FeatureSection />
    < Reviews/>
    <FreqAskedQuestions />
    <Contact />
    <Footer />
    </div>
  )
}

export default Home