import { Box} from "@radix-ui/themes";
import Expenses from "../../modules/Expenses/Expenses";

const ExpensesPage: React.FC = () => {
  return (
    <Box
      p="1"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        
      }}
    >

      {/* Expenses Module */}
      <Expenses />
    </Box>
  );
};

export default ExpensesPage;
