import Banner from "../../Components/User/Banner"
import Contact from "../../Components/User/Contact"
import FeatureSection from "../../Components/User/FeatureSection"
import Footer from "../../Components/User/Footer"
import FreqAskedQuestions from "../../Components/User/FreqAskedQuestions"
import Reviews from "../../Components/User/Reveiws"

const Home = () => {
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