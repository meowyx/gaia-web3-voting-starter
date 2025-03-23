"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@consensys/connect-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReadContract, useWriteContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contractAddress, contractAbi } from "@/constants";
import { Vote, Clock, User, CheckCircle2, Home as HomeIcon } from "lucide-react";
import { createPublicClient, createWalletClient, custom, http, parseAbi, encodeFunctionData } from 'viem';
import { mainnet } from 'viem/chains';
import { toast } from "sonner"; // For notifications

// Types
interface VotingOption {
  name: string;
  voteCount: bigint;
}

interface VotingDetails {
  description: string;
  options: VotingOption[];
  isActive: boolean;
  remainingTime: bigint;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [votings, setVotings] = useState<string[]>([]);
  const [votingDetails, setVotingDetails] = useState<Record<string, VotingDetails>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    options: ['', ''],
    durationType: 1
  });

  // Initialize Viem clients
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: mainnet,
    transport: custom(window.ethereum)
  });

  // Fetch all deployed votings
  const { data: votingCount } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVotingCount',
  });

  // Fetch deployed votings array
  const { data: deployedVotings } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getDeployedVotings',
  });

  // Create new voting
  const { writeContract, isPending } = useWriteContract();

  // Error handling wrapper
  const handleError = (error: any, message: string) => {
    console.error(message, error);
    if (error.message?.includes('user rejected')) {
      toast.error('Transaction rejected by user');
    } else if (error.message?.includes('insufficient funds')) {
      toast.error('Insufficient funds for transaction');
    } else {
      toast.error(`Error: ${message}`);
    }
  };

  // Fetch voting details
  const fetchVotingDetails = async (address: string) => {
    try {
      const details = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getVotingDetails',
        args: [address],
      }) as [string, VotingOption[], boolean, bigint];
      
      setVotingDetails(prev => ({
        ...prev,
        [address]: {
          description: details[0],
          options: details[1],
          isActive: details[2],
          remainingTime: details[3]
        }
      }));
    } catch (error) {
      handleError(error, 'Failed to fetch voting details');
    }
  };

  // Fetch all votings
  const fetchVotings = async () => {
    try {
      const deployedVotings = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getDeployedVotings',
      }) as string[];
      setVotings(deployedVotings);
    } catch (error) {
      handleError(error, 'Failed to fetch votings');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      description: '',
      options: ['', ''],
      durationType: 1
    });
  };

  // Create new voting
  const createVoting = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransactionPending(true);

    try {
      const [account] = await walletClient.getAddresses();
      
      // First estimate gas
      const gasEstimate = await publicClient.estimateGas({
        account,
        to: contractAddress,
        data: encodeFunctionData({
          abi: contractAbi,
          functionName: 'createVotingWithPredefinedDuration',
          args: [
            formData.description,
            formData.options.filter(opt => opt !== ''),
            formData.durationType
          ],
        }),
      });

      // Add 20% buffer to gas estimate
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createVotingWithPredefinedDuration',
        args: [
          formData.description,
          formData.options.filter(opt => opt !== ''),
          formData.durationType
        ],
        gas: gasLimit,
      });

      const hash = await walletClient.writeContract(request);
      toast.loading('Creating voting...');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Voting created successfully!');
      
      await fetchVotings();
      resetForm();
    } catch (error) {
      handleError(error, 'Failed to create voting');
    } finally {
      setTransactionPending(false);
    }
  };

  // Cast vote
  const castVote = async (votingAddress: string, optionIndex: number) => {
    setTransactionPending(true);
    try {
      const [account] = await walletClient.getAddresses();
      
      // First estimate gas
      const gasEstimate = await publicClient.estimateGas({
        account,
        to: votingAddress as `0x${string}`,
        data: encodeFunctionData({
          abi: contractAbi,
          functionName: 'vote',
          args: [BigInt(optionIndex)],
        }),
      });

      // Add 20% buffer to gas estimate
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      const { request } = await publicClient.simulateContract({
        account,
        address: votingAddress as `0x${string}`,
        abi: contractAbi,
        functionName: 'vote',
        args: [BigInt(optionIndex)],
        gas: gasLimit,
      });

      const hash = await walletClient.writeContract(request);
      toast.loading('Submitting vote...');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Vote submitted successfully!');
      
      await fetchVotingDetails(votingAddress);
    } catch (error) {
      handleError(error, 'Failed to cast vote');
    } finally {
      setTransactionPending(false);
    }
  };

  // Event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unwatch = publicClient.watchContractEvent({
      address: contractAddress,
      abi: contractAbi,
      eventName: 'VotingCreated',
      onLogs: (logs) => {
        fetchVotings();
      },
    });

    return () => {
      unwatch();
    };
  }, [isConnected]);

  // Render voting card
  const VotingCard = ({ address }: { address: string }) => {
    const details = votingDetails[address];
    if (!details) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{details.description}</CardTitle>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {details.isActive ? 
              `Time remaining: ${formatTime(details.remainingTime)}` : 
              'Voting ended'
            }
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {details.options.map((option, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{option.name}</span>
                <div className="space-x-2">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {option.voteCount.toString()} votes
                  </span>
                  {details.isActive && (
                    <Button
                      onClick={() => castVote(address, index)}
                      disabled={transactionPending}
                      size="sm"
                    >
                      <Vote className="mr-2 h-4 w-4" />
                      Vote
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-center items-center mt-16">
        <ConnectButton />
      </div>

      {isConnected && (
        <>
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              variant={!showCreateForm ? "default" : "outline"}
              onClick={() => setShowCreateForm(false)}
            >
              <HomeIcon className="mr-2 h-4 w-4" />
              View Votings ({votingCount?.toString() || '0'})
            </Button>
            <Button 
              variant={showCreateForm ? "default" : "outline"}
              onClick={() => setShowCreateForm(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Create New Voting
            </Button>
          </div>

          {showCreateForm ? (
            <Card className="mt-8 max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Create New Voting</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createVoting} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Voting Description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <Input
                        key={index}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            options: newOptions
                          }));
                        }}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        options: [...prev.options, '']
                      }))}
                    >
                      Add Option
                    </Button>
                  </div>

                  <select
                    className="w-full p-2 border rounded"
                    value={formData.durationType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      durationType: Number(e.target.value)
                    }))}
                  >
                    <option value={1}>5 Minutes</option>
                    <option value={2}>30 Minutes</option>
                    <option value={3}>1 Day</option>
                    <option value={4}>1 Week</option>
                  </select>

                  <Button 
                    type="submit"
                    disabled={transactionPending}
                    className="w-full"
                  >
                    {transactionPending ? 'Creating...' : 'Create Voting'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-8 space-y-4">
              {votings.map((address) => (
                <VotingCard key={address} address={address} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

// Utility function to format time
function formatTime(seconds: bigint): string {
  const days = Number(seconds) / (24 * 60 * 60);
  const hours = (Number(seconds) % (24 * 60 * 60)) / (60 * 60);
  const minutes = (Number(seconds) % (60 * 60)) / 60;
  
  if (days >= 1) return `${Math.floor(days)}d ${Math.floor(hours)}h`;
  if (hours >= 1) return `${Math.floor(hours)}h ${Math.floor(minutes)}m`;
  return `${Math.floor(minutes)}m`;
}
