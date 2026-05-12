import React from 'react';
import styled from 'styled-components';
import { Clock, User } from 'lucide-react';

export const MenuFlipCard = ({ title, category, price, time, servings, image }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="content">
          <div className="back">
            <div className="back-content">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#fffaf3] rounded-full flex items-center justify-center border border-[#dcc7a5]">
                 <span className="text-2xl font-black text-[#b98c52]">$</span>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-xl">{price}</p>
                <p className="text-[#b98c52] text-[10px] font-black uppercase tracking-widest mt-1">Precio sugerido</p>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:to-[#a97d45] transition-colors shadow-lg shadow-[rgba(185,140,82,0.18)]">
                Ver Detalles
              </button>
            </div>
          </div>
          <div className="front">
            <div className="img-container">
              <img src={image} alt={title} className="main-img" />
              <div className="overlay" />
            </div>
            <div className="front-content">
              <small className="badge">{category}</small>
              <div className="description">
                <div className="title-row">
                  <p className="title-text">
                    <strong>{title}</strong>
                  </p>
                  <svg fillRule="nonzero" height="15px" width="15px" viewBox="0,0,256,256" xmlns="http://www.w3.org/2000/svg"><g style={{mixBlendMode: 'normal'}} fillRule="nonzero" fill="#b98c52"><g transform="scale(8,8)"><path d="M25,27l-9,-6.75l-9,6.75v-23h18z" /></g></g></svg>
                </div>
                <div className="card-footer">
                   <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{time}</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{servings}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    overflow: visible;
    width: 240px;
    height: 320px;
    perspective: 1000px;
  }

  .content {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 600ms cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: 0px 0px 20px 1px rgba(185,140,82,0.06);
    border-radius: 2rem;
  }

  .front, .back {
    background-color: #fffaf3;
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 2rem;
    overflow: hidden;
    border: 1px solid rgba(185,140,82,0.06);
  }

  .back {
    justify-content: center;
    display: flex;
    align-items: center;
    transform: rotateY(180deg);
  }

  .back::before {
    position: absolute;
    content: ' ';
    display: block;
    width: 160px;
    height: 160%;
    background: linear-gradient(90deg, transparent, #b98c52, #d7b77f, transparent);
    animation: rotation_481 5000ms infinite linear;
  }

  .back-content {
    position: absolute;
    width: 98%;
    height: 98%;
    background-color: #09090b;
    border-radius: 1.9rem;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    z-index: 10;
  }

  .card:hover .content {
    transform: rotateY(180deg);
  }

  @keyframes rotation_481 {
    0% { transform: rotateZ(0deg); }
    100% { transform: rotateZ(360deg); }
  }

  .front {
    color: white;
  }

  .img-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, #000, transparent);
    opacity: 0.8;
  }

  .front .front-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 5;
  }

  .front-content .badge {
    background-color: rgba(185, 140, 82, 0.18);
    padding: 4px 12px;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    width: fit-content;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #f7f1e7;
    border: 1px solid rgba(185, 140, 82, 0.24);
  }

  .description {
    width: 100%;
    padding: 15px;
    background-color: rgba(24, 24, 27, 0.58);
    backdrop-filter: blur(12px);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .title-text {
    font-size: 14px;
    font-weight: 800;
    color: white;
  }

  .card-footer {
    display: flex;
    gap: 15px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 10px;
    font-weight: 700;
  }
`;
