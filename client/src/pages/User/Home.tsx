import Banner from "../../Components/User/Home/Banner"
import Contact from "../../Components/Forms/Contact"
import FeatureSection from "../../Components/User/Home/FeatureSection"
import Footer from "../../Components/User/Home/Footer"
import FreqAskedQuestions from "../../Components/User/Home/FreqAskedQuestions"
import Reviews from "../../Components/User/Home/Reveiws"


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