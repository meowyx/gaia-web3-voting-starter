"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@consensys/connect-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReadContract, useWriteContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contractAddress, contractAbi } from "@/constants";
import { Vote, Clock, User, CheckCircle2, Home as HomeIcon } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Read all voting options
  const { data: options, isLoading: optionsLoading } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getAllOptions',
  });

  // Read if voting is still active
  const { data: isVotingActive } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'isVotingActive',
  });

  // Read if user has already voted
  const { data: hasVoted } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'hasVoted',
    args: [address],
  });

  // Setup vote transaction
  const { writeContract, isPending } = useWriteContract();

  const handleVote = async () => {
    if (selectedOption === null) return;

    try {
      await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'vote',
        args: [BigInt(selectedOption)],
      });
    } catch (error) {
      console.error('Voting failed:', error);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-center items-center mt-16">
        <ConnectButton />
      </div>

      {isConnected && (
        <Card className="mt-8 max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Voting System</CardTitle>
          </CardHeader>
          <CardContent>
            {optionsLoading ? (
              <div>Loading options...</div>
            ) : hasVoted ? (
              <div className="text-center text-yellow-600">You have already voted!</div>
            ) : !isVotingActive ? (
              <div className="text-center text-red-600">Voting has ended</div>
            ) : (
              <div className="space-y-4">
                {options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name="voting-option"
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`option-${index}`} className="flex-1">
                      {option.name} ({option.voteCount.toString()} votes)
                    </label>
                  </div>
                ))}
                <Button 
                  onClick={handleVote}
                  disabled={selectedOption === null || isPending || hasVoted}
                  className="w-full"
                >
                  {isPending ? 'Submitting Vote...' : 'Vote'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
