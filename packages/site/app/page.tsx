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
  
  return (
    <main className="container mx-auto p-4">
   
      {/* Top Centered Button */}
      <div className="flex justify-center items-center mt-16">
        <Button><ConnectButton /></Button>
      </div>
    
    </main>
  );
}
