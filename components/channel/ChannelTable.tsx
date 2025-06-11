'use client';
import { useState } from 'react';
import ChannelViewDetail from './ChannelViewDetail';
import ChannelForm from './ChannelForm';
import { ExtraFeeRule } from './ExtraFeeRule/types';
import { Channel } from '../types/shipment';

interface ChannelTableProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel | null) => void;
  onCreateTemplate: (channelId: string) => void;
}

export default function ChannelTable({
  channels,
  onSelectChannel,
  onCreateTemplate,
}: ChannelTableProps) {
  const [viewing, setViewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleViewDetail = (channel: Channel) => {
    setSelectedChannel(channel);
    setViewing(true);
  };

  const handleEditChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setEditing(true);
  };

  const handleClose = () => {
    setViewing(false);
    setEditing(false);
    setSelectedChannel(null);
  };

  const toFormData = (channel: Channel | null) => {
    if (!channel) return undefined;
    return {
      ...channel,
      extraFeeRules: channel.extraFeeRules || [],
    };
  };

  return (
    <>
      <div className="glass rounded-3xl shadow-xl p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">渠道列表</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create Channel Card */}
          <div className="card cursor-pointer" onClick={() => onSelectChannel(null)}>
            <div className="content">
              <div className="back">
                <div className="back-content">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <strong>新增渠道</strong>
                </div>
              </div>
              <div className="front">
                <div className="img">
                  <div className="circle"></div>
                  <div className="circle" id="right"></div>
                  <div className="circle" id="bottom"></div>
                </div>
                <div className="front-content">
                  <small className="badge">新增</small>
                  <div className="description">
                    <div className="title">
                      <p className="title">
                        <strong>添加渠道</strong>
                      </p>
                    </div>
                    <p className="card-footer">点击添加</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Cards */}
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="card cursor-pointer"
              onClick={() => handleViewDetail(channel)}
            >
              <div className="content">
                <div className="back">
                  <div className="back-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="50"
                      height="50"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16v16H4z"></path>
                    </svg>
                    <strong>{channel.name}</strong>
                  </div>
                </div>
                <div className="front">
                  <div className="img">
                    <div className="circle"></div>
                    <div className="circle" id="right"></div>
                    <div className="circle" id="bottom"></div>
                  </div>
                  <div className="front-content">
                    <small className="badge">{channel.type}</small>
                    <div className="description">
                      <div className="title">
                        <p className="title">
                          <strong>{channel.name}</strong>
                        </p>
                      </div>
                      <p className="card-footer">
                        {channel.country || '-'} | {channel.currency} |{' '}
                        {channel.createdAt ? new Date(channel.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button
                  className="text-indigo-600 hover:underline text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(channel);
                  }}
                >
                  查看
                </button>
                <button
                  className="text-blue-600 hover:underline text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditChannel(channel);
                  }}
                >
                  修改
                </button>
                <button
                  className="text-indigo-600 hover:underline text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTemplate(channel.id);
                  }}
                >
                  标签
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ChannelViewDetail channel={selectedChannel} isOpen={viewing} onClose={handleClose} />
      <ChannelForm
        isOpen={editing}
        onClose={handleClose}
        initialData={toFormData(selectedChannel)}
        onSubmitSuccess={handleClose}
      />
    </>
  );
}
