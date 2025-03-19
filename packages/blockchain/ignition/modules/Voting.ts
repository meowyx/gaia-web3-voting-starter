// This script deploys the Voting contract using Hardhat Ignition
// Learn more at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Default values
const DEFAULT_DESCRIPTION = "Default Voting Scenario";
const DEFAULT_OPTIONS = ["Option 1", "Option 2", "Option 3"];
const DEFAULT_DURATION_MINUTES = 10080; // 1 week in minutes

const VotingModule = buildModule("VotingModule", (m) => {
  // Define parameters with default values
  const description = m.getParameter("description", DEFAULT_DESCRIPTION);
  const options = m.getParameter("options", DEFAULT_OPTIONS);
  const durationInMinutes = m.getParameter("durationInMinutes", DEFAULT_DURATION_MINUTES);

  // Deploy the Voting contract with the provided parameters
  const voting = m.contract("Voting", [description, options, durationInMinutes]);

  return { voting };
});

export default VotingModule;