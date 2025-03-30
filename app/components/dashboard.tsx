import ImageUpload from "./ImageUpload";
import { WavyBackground } from "../../components/ui/ui/wavy-backgrounds";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <WavyBackground
        colors={["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]}
        waveWidth={50}
        backgroundFill="black"
        blur={10}
        speed="fast"
        waveOpacity={0.5}
        containerClassName="relative"
      >
        <h1 className="text-2xl font-bold mb-6 text-white text-center pt-8">
          Results
        </h1>

        <div className="relative z-10">
          <ImageUpload />
        </div>
      </WavyBackground>
    </div>
  );
}
