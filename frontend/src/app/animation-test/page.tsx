import { ClientOnly } from "../../components/client-only";
import { AnimationTest } from "../../features/animation-test";

const AnimationTestPage = () => {
  return (
    <ClientOnly>
      <AnimationTest />
    </ClientOnly>
  );
};

export default AnimationTestPage;
