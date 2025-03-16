"use client";

import { Button, Card, Drawer } from "antd";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import _, { isEmpty } from "lodash";
import { EnumComputerStatus } from "@/constants/enum";
import { useQuery } from "@tanstack/react-query";
import { usePolling } from "@/hooks/usePolling";

const Dashboard = () => {
  const refreshRef = useRef();
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [currentComputer, setCurrentComputer] = useState();
  const [computers, setComputers] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(60);

  const { data } = usePolling<any[]>("/api/computer", {
    interval: 60000, // 60 seconds
    onSuccess: (data) => {
      const computerSorted = _.sortBy(data, (o) => o.name);
      setComputers(computerSorted);
      setCountdown(60);
    },
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="shadow-lg rounded-lg w-full overflow-auto max-h-[89vh] relative">
        <div className="w-full bg-gray-900/95 rounded-xl p-6 border border-gray-800 shadow-lg">
          <div className="flex justify-end items-center gap-4 mt-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="text-white">{`Dữ liệu sẽ cập nhật sau: ${countdown}s`}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-white">Đang khởi động</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white">Đang sử dụng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-white">Máy tắt</span>
            </div>
          </div>
          <Card className="w-full">
            <div className="flex flex-wrap justify-start items-center">
              {computers.map((item, index) => {
                const { name, status, userName, userId, round, canClaim } =
                  item || {};
                let bgColor = "bg-gray-400";
                if (status === EnumComputerStatus.ON.id) {
                  bgColor = "bg-green-500";
                } else if (status === EnumComputerStatus.READY.id) {
                  bgColor = "bg-orange-500";
                }
                return (
                  <div
                    key={index}
                    className={`${bgColor} text-white font-bold h-28 w-24 m-2 relative cursor-pointer`}
                  >
                    <div className="absolute top-2 left-2 cursor-pointer">
                      <div>{name}</div>
                      {!isEmpty(userName) && (
                        <div className="text-[9px] truncate">
                          {userName.toUpperCase()}
                        </div>
                      )}
                      {isEmpty(userName) &&
                        status === EnumComputerStatus.ON.id && (
                          <div className="text-[11px] truncate text-red-700 overflow-hidden display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical">
                            Chưa sử dụng
                          </div>
                        )}

                      <div className="text-[9px] truncate text-orange-400 font-bold">
                        {userId}
                      </div>

                      {!isEmpty(userName) && userId !== 0 && (
                        <div className="text-[9px] truncate text-purple-800 font-bold">
                          {`Điểm danh: ${canClaim.toLocaleString()}`}
                        </div>
                      )}
                      {!isEmpty(userName) && userId !== 0 && (
                        <div className="text-[9px] truncate text-blue-500 font-bold">
                          {`Lượt quay: ${round.toLocaleString()}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
