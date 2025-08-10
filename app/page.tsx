"use client";

import React, { useMemo, useState } from "react";

// Three‑Piece Tic‑Tac‑Toe (a.k.a. FIFO Tic‑Tac‑Toe)
// Rules:
// - Standard 3x3 grid.
// - Each player may have at most THREE pieces on the board.
// - When a player places a fourth piece, their OLDEST piece disappears.
// - The oldest piece for any player (when they have 3 on board) is shaded.
// - First to align three in a row wins.

type Player = "X" | "O";
type Cell = Player | null;

type Winner = { player: Player; line: number[] } | null;

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: Cell[]): Winner {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = board[a];
    if (v && v === board[b] && v === board[c]) return { player: v, line };
  }
  return null;
}

function cx(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

export default function Page() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const [queues, setQueues] = useState<Record<Player, number[]>>({ X: [], O: [] });
  const [winner, setWinner] = useState<Winner>(null);

  const winningLine = useMemo(() => getWinner(board)?.line ?? null, [board]);
  const oldestIndex = (p: Player): number | null =>
    queues[p].length === 3 ? queues[p][0] : null;

  const handleClick = (i: number) => {
    if (winner || board[i]) return;

    const newBoard = [...board];
    newBoard[i] = turn;

    const newQueues: Record<Player, number[]> = {
      X: [...queues.X],
      O: [...queues.O],
    };
    newQueues[turn] = [...newQueues[turn], i];

    if (newQueues[turn].length > 3) {
      const removeIndex = newQueues[turn].shift()!; // remove oldest
      newBoard[removeIndex] = null;
    }

    setBoard(newBoard);
    setQueues(newQueues);

    const w = getWinner(newBoard);
    if (w) {
      setWinner(w);
    } else {
      setTurn(turn === "X" ? "O" : "X");
    }
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setQueues({ X: [], O: [] });
    setWinner(null);
  };

  const status = winner
    ? `${winner.player} wins!`
    : `Turn: ${turn}`;

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-800 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Three‑Piece Tic‑Tac‑Toe</h1>
            <p className="text-sm text-neutral-500">
              You can keep only 3 pieces on the board. The oldest piece (shaded)
              will disappear when you place a new one.
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm shadow-sm hover:shadow transition active:scale-[0.99]"
            aria-label="Reset the game"
          >
            Reset
          </button>
        </header>

        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-1 text-sm shadow-sm">
            <span className="font-medium">Status:</span>
            <span className={cx(
              "font-semibold",
              status.includes("X") && "text-sky-700",
              status.includes("O") && "text-rose-700"
            )}>{status}</span>
          </span>
          <span className="text-xs text-neutral-500">Shaded piece = next to disappear.</span>
        </div>

        <div
          role="grid"
          aria-label="Three‑Piece Tic‑Tac‑Toe board"
          className="grid grid-cols-3 gap-2"
        >
          {board.map((val, i) => {
            const isWinning = winningLine?.includes(i) ?? false;
            const isNextToDisappearForX = oldestIndex("X") === i && board[i] === "X";
            const isNextToDisappearForO = oldestIndex("O") === i && board[i] === "O";
            const shaded = isNextToDisappearForX || isNextToDisappearForO;

            return (
              <button
                key={i}
                role="gridcell"
                aria-label={val ? `Cell ${i + 1}: ${val}` : `Place ${turn} at cell ${i + 1}`}
                disabled={Boolean(val) || Boolean(winner)}
                onClick={() => handleClick(i)}
                className={cx(
                  "relative aspect-square w-full rounded-2xl border border-neutral-300 bg-white shadow-sm",
                  "hover:shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                  val && "cursor-not-allowed",
                  isWinning && "ring-2 ring-offset-2 ring-emerald-500",
                )}
              >
                {/* Shading overlay for the oldest piece that will disappear next for its owner */}
                {shaded && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-neutral-900/8" />
                )}

                <span
                  className={cx(
                    "pointer-events-none select-none text-6xl font-extrabold",
                    "absolute inset-0 flex items-center justify-center",
                    val === "X" && "text-sky-600",
                    val === "O" && "text-rose-600",
                  )}
                >
                  {val}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend showing which piece will disappear next for each player */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          {["X", "O"].map(p => {
            const player = p as Player;
            const idx = oldestIndex(player);
            const hasThree = queues[player].length === 3;
            return (
              <div key={player} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                <span className={cx(
                  "grid h-6 w-6 place-items-center rounded-md text-xs font-bold",
                  player === "X" ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"
                )}>{player}</span>
                <span className="text-neutral-600">
                  {hasThree ? (
                    <>
                      Oldest piece: <span className="font-medium">cell {String((idx ?? 0) + 1)}</span> (shaded)
                    </>
                  ) : (
                    <>Pieces on board: {queues[player].length}</>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {winner && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <p className="font-medium">Game over</p>
            <p className="text-sm">{winner.player} made three in a row.</p>
          </div>
        )}

        {!winner && (
          <p className="mt-6 text-xs text-neutral-500">
            Tip: You cannot draw here—pieces cycle off. Try to force your opponent to
            break their alignment while you set up yours.
          </p>
        )}
      </div>
    </div>
  );
}
