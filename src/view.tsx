// import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Game, Player, Vec2D, vec2D } from "./common/pong";
// import { Control, DisplayElement } from "./script";

// export interface GameScreenProps {
//   goBack: Dispatch<SetStateAction<string>>,
//   score: {p1: number, p2: number},
//   ball: DisplayElement,
//   p1: DisplayElement,
//   p2: DisplayElement,
//   winner: Player | null
//   orientation: string,
//   setOrientation: (arg: string) => void,
//   setDimensions: (arg: Vec2D) => void,
// }

// export interface MainMenuProps {
//   game: Game | undefined,
//   handleCtrlClick: () => void,
//   handleNewGameClick: () => void,
//   handleContinueClick: () => void,
//   controlP1: Control,
//   controlP2: Control
// }

// export interface ContinuteButtonProps {
//   clickHandler: () => void
// }

// export interface PlayerControlsButtonProps {
//   toggleCtrlType: (arg: string) => void,
//   toggleSubtype:  (arg: string) => void, 
//   player: string,
//   label: string,
//   playerType: string,
//   descr: string
// }

// export interface SetControlsMenuProps {
//   controlP1: Control,
//   controlP2: Control,
//   goBack: (arg: string) => void;
//   toggleCtrl: (arg: string) => void,
//   toggleSubtype: (arg: string) => void,
// }

// const GameScreen = (props: GameScreenProps) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const width = useRef(0);
//   const height = useRef(0);
//   const [orientation, setOrientation] = [props.orientation, props.setOrientation];

//   useEffect(() => {
//     if (ref.current !== null) {
//       width.current = ref.current.offsetWidth;
//       height.current = ref.current.offsetHeight;
//     }
//   });

//   useEffect(() => {
//     const dims = vec2D(width.current, height.current);
//     props.setDimensions(dims);
//   }, [width.current, height.current]);

//   useEffect(() => {
//     updateOrientation()
//   }, [width.current, height.current]);

//   const updateOrientation = () => {
//     if (height.current > width.current &&
//       (!orientation || orientation === 'horz')) {
//       setOrientation('vert');
//     }
//     else if (height.current < width.current &&
//       (!orientation || orientation === 'vert')) {
//       setOrientation('horz');
//     }
//   }

//   if (orientation === undefined) {
//     return (
//       <div ref={ref} className="game-screen"></div>
//     );
//   }

//   return (
//     <div ref={ref} className="game-screen">
//       {MidLine(orientation)}
//       {IngameMenuButton(props.goBack, orientation)}
//       {ScoreView("p1", props.score.p1, orientation)}
//       {ScoreView("p2", props.score.p2, orientation)}
//       {PieceView(props.ball, orientation)}
//       {PieceView(props.p1, orientation)}
//       {PieceView(props.p2, orientation)}
//       {MessageView(props.winner)}
//     </div>
//   );
// }

// export const MainMenu = (props: MainMenuProps) => {
  
//   return (
//     <div className = "menu-container">
//       <div className = "menu">
//         <h1 className = "menu-title">PONG</h1>
//         <MenuButton 
//           clickHandler = {props.handleCtrlClick} 
//           text = {"SET CONTROLS"}
//         />
//         <MenuButton 
//           clickHandler = {props.handleNewGameClick} 
//           text = {"NEW GAME"}
//         />
//         {props.game && <ContinueButton
//           clickHandler = {props.handleContinueClick}
//         />
//         }
//       </div>
//     </div>
//   );
// }

// const MessageView = (winner: Player | null) => {
//   if (winner) {
//     const wp = winner === Player.P1 ? "PLAYER 1" : "PLAYER 2";
//     return (
//       <div className="win-message">
//         <h1 className = "win-h1">
//           {wp + " WON!"}
//         </h1>
//         <p className="win-p">press any key to continue</p>
//       </div>
//     );
//   }
// }

// const MidLine = (orientation: string) => {
//   const cn = orientation === "horz" ? 'midline-vert' : 'midline-horz';
//   return (
//     <div className={cn}></div>
//   );
// }

// const PieceView = (el: DisplayElement, orientation: string) => {
//   const className = el.id === "ball" ? "ball" : "paddle";
//   const vert = orientation === "vert";
//   const style = {
//     left: vert ? el.top : el.left,
//     top: vert ? el.left : el.top,
//     width: vert ? el.height : el.width,
//     height: vert ? el.width : el.height
//   };
//   return (
//     <div className={className} style={style}></div>
//   );
// }

// const ScoreView = (pid: string, score: number, orientation: string) => {
//   const cn = orientation === "vert" ? `${pid}-vert` : `${pid}-horz`;
//   return (
//       <p className = {"score " + cn} >
//         {score}
//       </p>
//   );
// }

// const IngameMenuButton = (goBack: (arg: string) => void, orientation: string) => {
//   const co = orientation === "vert" ? "mbi-vert" : "mbi-horz";
//   const cn = "menu-button-ingame " + co; 
//   const handleBackClick = () => goBack("");
//   return (
//     <button className={cn}>
//       <div className="menu-icon" onClick ={handleBackClick}>
//         <div className="menu-icon-dot"></div>
//         <div className="menu-icon-dot"></div>
//         <div className="menu-icon-dot"></div>
//       </div>
//     </button>
//   );
// }

// const MenuButton = (props: {clickHandler: () => void, text: string}) => {
//   return (
//     <button onClick = {props.clickHandler} className="menu-button">
//       {props.text}
//     </button>
//   );
// }

// const ContinueButton = (props: ContinuteButtonProps) => {
//     return (
//       <button 
//         onClick={props.clickHandler}
//         className="menu-button"
//       >
//         CONTINUE GAME
//       </button>
//     );
// }

// const CycleButton = (props: {handleClick: () => void, text: string}) => {
//   return (
//     <button 
//       className = "menu-button cycle-button"
//       dangerouslySetInnerHTML={{__html: props.text}}
//       onClick = {props.handleClick}
//     >
//     </button>
//   );
// }

// const PlayerControlsButton = (props: PlayerControlsButtonProps) => {
//   const handleToggleCtrl = () => {props.toggleCtrlType(props.player)};
//   const handleToggleSubtype = () => {props.toggleSubtype(props.player)};

//   return (
//     <div className = "player-controls-button">
//       <p className = "player-controls-label"> {props.label} </p>
//       <CycleButton 
//         text = {props.playerType}
//         handleClick = {handleToggleCtrl}
//       />
//       <CycleButton 
//         text = {props.descr}
//         handleClick = {handleToggleSubtype}
//       />
//     </div>
//   );
// }

// export const SetControlsMenu = (props: SetControlsMenuProps) => {
//   const [clicked, setClicked] = useState("null");
//   const handleBackClick = () => props.goBack("");
//   const arrowL = `<span class="rotate90">&#8593;</span>`
//   const arrowR = `<span class="rotate90">&#8595;</span>`
//   const arrowDescr = `&#8593;/&#8595; ${arrowL}/${arrowR}`;
//   let descrP1;
//   let descrP2;
//   if (props.controlP1.type === 'human') {
//     descrP1 = props.controlP1.subtype === 'key' ? "w/s a/d" : "touch"; 
//   }
//   else {
//     descrP1 = props.controlP1.subtype;
//   }
//   if (props.controlP2.type === 'human') {
//     descrP2 = props.controlP2.subtype === 'key' ? arrowDescr : "touch"; 
//   }
//   else {
//     descrP2 = props.controlP2.subtype;
//   }

//   if (clicked === "back") {
//     props.goBack("")
//   }
//   return (
//     <div className = "menu-container">
//       <div className = "menu">
//         <h1 className = "menu-title">
//           PONG
//         </h1>
//         <PlayerControlsButton 
//           label = "P1:"
//           player = "p1"
//           playerType = {props.controlP1.type}
//           descr = {descrP1}
//           toggleCtrlType = {props.toggleCtrl}
//           toggleSubtype = {props.toggleSubtype}
//         />
//         <PlayerControlsButton 
//           label = "P2:"
//           player = "p2"
//           playerType = {props.controlP2.type}
//           descr = {descrP2}
//           toggleCtrlType = {props.toggleCtrl}
//           toggleSubtype = {props.toggleSubtype}
//         />
//         <MenuButton 
//           clickHandler = {handleBackClick} 
//           text = {"GO BACK"}
//         />
//       </div>
//     </div>
//   );
// }

