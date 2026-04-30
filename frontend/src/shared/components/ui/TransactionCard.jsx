import React from 'react';
import styled from 'styled-components';
import { ChevronRight, Plus } from 'lucide-react';

export const TransactionCard = ({ label, onClick }) => {
  return (
    <StyledWrapper>
      <div className="container" onClick={onClick}>
        <div className="left-side">
          <div className="card">
            <div className="card-line" />
            <div className="buttons" />
          </div>
          <div className="post">
            <div className="post-line" />
            <div className="screen">
              <div className="dollar">$</div>
            </div>
            <div className="numbers" />
            <div className="numbers-line2" />
          </div>
        </div>
        <div className="right-side">
          <div className="new-text">{label}</div>
          <ChevronRight className="arrow" />
        </div>
        
        {/* Decorative Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    background-color: rgba(24, 24, 27, 0.6);
    backdrop-filter: blur(20px);
    display: flex;
    width: 320px;
    height: 100px;
    position: relative;
    border-radius: 1.5rem;
    transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid rgba(168, 85, 247, 0.2);
    cursor: pointer;
    overflow: hidden;
  }

  .container:hover {
    transform: scale(1.02);
    border-color: rgba(168, 85, 247, 0.5);
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.15);
  }

  .left-side {
    background: linear-gradient(135deg, #9333ea, #4f46e5);
    width: 100px;
    height: 100%;
    border-radius: 1.4rem;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.4s;
    flex-shrink: 0;
    overflow: hidden;
  }

  .right-side {
    width: calc(100% - 100px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    transition: 0.3s;
  }

  .new-text {
    font-size: 16px;
    font-weight: 900;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .arrow {
    width: 24px;
    height: 24px;
    color: #a855f7;
    transition: transform 0.3s;
  }

  .container:hover .arrow {
    transform: translateX(5px);
  }

  .card {
    width: 60px;
    height: 40px;
    background-color: #1e1e2d;
    border-radius: 8px;
    position: absolute;
    display: flex;
    z-index: 10;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(168, 85, 247, 0.3);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  }

  .card-line {
    width: 50px;
    height: 10px;
    background-color: #a855f7;
    border-radius: 2px;
    margin-top: 6px;
    opacity: 0.8;
  }

  .buttons {
    width: 6px;
    height: 6px;
    background-color: #6366f1;
    box-shadow: 0 -8px 0 0 #8b5cf6, 0 8px 0 0 #c084fc;
    border-radius: 50%;
    margin-top: 4px;
    transform: rotate(90deg);
    margin: 10px 0 0 -24px;
  }

  .container:hover .card {
    animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
  }

  @keyframes slide-top {
    0% { transform: translateY(0); }
    50% { transform: translateY(-60px) rotate(90deg); }
    100% { transform: translateY(-5px) rotate(90deg); }
  }

  .post {
    width: 55px;
    height: 70px;
    background-color: #09090b;
    position: absolute;
    z-index: 11;
    top: 100px;
    border-radius: 6px;
    border: 1px solid #27272a;
  }

  .container:hover .post {
    animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
  }

  @keyframes slide-post {
    100% { transform: translateY(-65px); }
  }

  .screen {
    width: 45px;
    height: 20px;
    background-color: #18181b;
    position: absolute;
    top: 20px;
    right: 5px;
    border-radius: 3px;
    border: 1px solid #3f3f46;
  }

  .dollar {
    font-size: 14px;
    font-weight: 900;
    color: #a855f7;
    text-align: center;
    line-height: 20px;
  }
`;
