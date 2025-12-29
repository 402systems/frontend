'use client';

import { DisplayCard } from '@/components/DisplayCard';
import {
  findCommonSymbol,
  generateDobbleDeck,
  type DobbleCard,
} from '@/lib/dobble';
import { Button } from '@402systems/core-ui/components/ui/button';
import { Slider } from '@402systems/core-ui/components/ui/slider';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [n, setN] = useState<number>(7);
  const [deck, setDeck] = useState<DobbleCard[]>([]);
  const [opponentCard, setOpponentCard] = useState<DobbleCard | null>(null);
  const [userCard, setUserCard] = useState<DobbleCard | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [shakeScreen, setShakeScreen] = useState(false);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    try {
      const generatedDeck = generateDobbleDeck(n);
      // Shuffle the deck (simple shuffle for now)
      const shuffledDeck = generatedDeck.sort(() => Math.random() - 0.5);

      if (shuffledDeck.length >= 2) {
        setUserCard(shuffledDeck[0]);
        setOpponentCard(shuffledDeck[1]);
        setDeck(shuffledDeck.slice(2)); // Rest of the deck
        setGameStarted(true);
        setGameOver(false);
        setStartTime(Date.now());
        setElapsedTime(0);
      } else {
        console.error('Deck too small to start game. n might be too small.');
      }
    } catch (error) {
      console.error('Error generating Dobble deck:', error);
    }
  };

  const handleSymbolClick = (clickedSymbolId: number) => {
    if (!gameStarted || gameOver || !userCard || !opponentCard) return;

    const commonSymbol = findCommonSymbol(userCard, opponentCard);

    if (commonSymbol === clickedSymbolId) {
      // Correct match
      if (deck.length > 0) {
        setUserCard(opponentCard); // User's card becomes the previous opponent's card
        setOpponentCard(deck[0]); // Opponent's card is the next from the deck
        setDeck(deck.slice(1)); // Remove the drawn card from the deck
      } else {
        // Last card, game over
        setGameOver(true);
        setGameStarted(false);
        if (startTime) {
          setElapsedTime(Date.now() - startTime);
        }
      }
    } else {
      // Incorrect match - trigger screen shake
      setShakeScreen(true);
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
      shakeTimeoutRef.current = setTimeout(() => {
        setShakeScreen(false);
      }, 100); // Shake for 0.1 seconds
    }
  };

  useEffect(() => {
    if (gameStarted && !gameOver && startTime) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100); // Update every 100ms for responsiveness
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, [gameStarted, gameOver, startTime]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    return `${seconds}.${ms < 100 ? '0' : ''}${Math.floor(ms / 10)}`; // Format as S.dd
  };

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 transition-transform duration-75 ${shakeScreen ? 'animate-shake' : ''}`}
    >
      <h1 className="mb-8 text-3xl font-bold">Dobble Game (Solo)</h1>

      {!gameStarted && !gameOver && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex flex-col space-y-1">
            <Slider
              defaultValue={[5]}
              max={7}
              step={1}
              onValueChange={(v) => setN(v[0])}
            />
            <p>Number of Symbols: {n}</p>
          </div>
          <Button onClick={startGame} className="mb-4">
            Start Game
          </Button>
        </div>
      )}

      {gameStarted && (
        <div className="mb-4 text-lg">Time: {formatTime(elapsedTime)}s</div>
      )}

      {gameOver && (
        <div className="mb-4 text-2xl font-semibold text-green-600">
          Game Over! Your time: {formatTime(elapsedTime)}s
          <Button onClick={startGame} className="ml-4">
            Play Again
          </Button>
        </div>
      )}

      {gameStarted && (
        <>
          {/* Opponent's Card Area */}
          <div className="mb-4 flex w-full max-w-sm flex-1 flex-col items-center justify-center">
            {opponentCard ? (
              <DisplayCard
                heading="Opponent Card"
                dobbleCard={opponentCard}
                onClick={handleSymbolClick}
              />
            ) : (
              <div className="w-full">
                <div>
                  <h1>Opponent Card</h1>
                </div>
                <h1>Waiting for cards...</h1>
              </div>
            )}
          </div>

          {/* Separator/Game Info (e.g., Score, Time) */}
          <div className="text-sm">{deck.length} cards left in pile.</div>

          {/* User's Card Area */}
          <div className="mt-1 flex w-full max-w-sm flex-1 flex-col items-center justify-center">
            {userCard ? (
              <DisplayCard
                heading="Your Card"
                dobbleCard={userCard}
                onClick={handleSymbolClick}
              />
            ) : (
              <div className="w-full">
                <div>
                  <h1>Your Card</h1>
                </div>
                <h1>Waiting for cards...</h1>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
