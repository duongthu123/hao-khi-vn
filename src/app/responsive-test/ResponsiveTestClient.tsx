'use client';

import { useState } from 'react';
import { MenuLayout } from '@/components/layout/MenuLayout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ResponsiveTestClient() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('unknown');

  // Detect current breakpoint (for demonstration)
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    const breakpoint = 
      width >= 1024 ? 'desktop (1024px+)' :
      width >= 768 ? 'tablet (768px+)' :
      'mobile (320px+)';
    
    if (breakpoint !== currentBreakpoint) {
      setCurrentBreakpoint(breakpoint);
    }
  }

  return (
    <MenuLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl tablet:text-5xl desktop:text-6xl font-bold mb-4 bg-gradient-vietnamese bg-clip-text text-transparent">
            Responsive Layout Test
          </h1>
          <p className="text-lg tablet:text-xl text-gray-700">
            Current Breakpoint: <span className="font-bold text-vietnam-500">{currentBreakpoint}</span>
          </p>
          <p className="text-sm tablet:text-base text-gray-500 mt-2">
            Resize your browser window to see responsive changes
          </p>
        </div>

        {/* Breakpoint Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Breakpoint Indicators</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="p-4 bg-blue-100 rounded mobile:block tablet:hidden desktop:hidden">
                <span className="font-bold text-blue-800">📱 Mobile (320px+)</span>
                <p className="text-sm text-blue-600">You are viewing the mobile layout</p>
              </div>
              <div className="p-4 bg-green-100 rounded hidden tablet:block desktop:hidden">
                <span className="font-bold text-green-800">📱 Tablet (768px+)</span>
                <p className="text-sm text-green-600">You are viewing the tablet layout</p>
              </div>
              <div className="p-4 bg-purple-100 rounded hidden desktop:block">
                <span className="font-bold text-purple-800">🖥️ Desktop (1024px+)</span>
                <p className="text-sm text-purple-600">You are viewing the desktop layout</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Typography Scaling */}
        <Card>
          <CardHeader>
            <CardTitle>Typography Scaling</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Main Title (text-4xl → text-5xl → text-6xl)</p>
                <h2 className="text-4xl tablet:text-5xl desktop:text-6xl font-bold text-vietnam-500">
                  Đại Chiến Sử Việt
                </h2>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Subtitle (text-xl → text-2xl)</p>
                <p className="text-xl tablet:text-2xl text-gray-700">
                  Hào Khí Đông A
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Body Text (text-sm → text-base)</p>
                <p className="text-sm tablet:text-base text-gray-600">
                  Vietnamese Historical Strategy Game - Trò chơi chiến lược lịch sử Việt Nam
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Grid Layout */}
        <Card>
          <CardHeader>
            <CardTitle>Grid Layout (2 → 3 → 4 columns)</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div
                  key={num}
                  className="p-6 bg-gradient-river rounded-lg text-white text-center font-bold"
                >
                  Item {num}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Padding & Spacing */}
        <Card>
          <CardHeader>
            <CardTitle>Padding & Spacing</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="p-4 tablet:p-8 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">
                  This box has responsive padding: p-4 (mobile) → tablet:p-8
                </p>
              </div>
              <div className="space-y-2 tablet:space-y-4">
                <div className="p-3 bg-imperial-100 rounded">Item with responsive spacing</div>
                <div className="p-3 bg-imperial-100 rounded">space-y-2 → tablet:space-y-4</div>
                <div className="p-3 bg-imperial-100 rounded">Gap increases on larger screens</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Button Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Touch-friendly buttons (minimum 44x44px)</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">Small Button</Button>
                  <Button variant="primary" size="md">Medium Button</Button>
                  <Button variant="primary" size="lg">Large Button</Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Responsive button layout</p>
                <div className="flex flex-col tablet:flex-row gap-2">
                  <Button variant="secondary" className="flex-1">Stacked on Mobile</Button>
                  <Button variant="secondary" className="flex-1">Side-by-side on Tablet+</Button>
                  <Button variant="secondary" className="flex-1">Equal Width</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Vietnamese Text */}
        <Card>
          <CardHeader>
            <CardTitle>Vietnamese Text Readability</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-vietnam-500 mb-2">
                  Trần Hưng Đạo - Anh Hùng Dân Tộc
                </h3>
                <p className="text-sm tablet:text-base text-gray-700 leading-relaxed">
                  Hưng Đạo Vương Trần Quốc Tuấn (1228-1300) là vị thống soái tài ba đã lãnh đạo 
                  quân dân Đại Việt đánh thắng ba lần quân Mông Cổ xâm lược. Bài "Hịch tướng sĩ" 
                  nổi tiếng của ông đã khơi dậy tinh thần yêu nước và ý chí chiến đấu của toàn 
                  quân toàn dân.
                </p>
              </div>
              <div className="p-4 bg-bamboo-50 rounded">
                <p className="text-xs tablet:text-sm text-bamboo-800 italic">
                  "Giặc đến nhà đàn ông đánh giặc, đàn bà cũng đánh giặc" - Trần Hưng Đạo
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Visibility Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Visibility</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="p-3 bg-blue-100 rounded block tablet:hidden">
                <span className="text-blue-800 font-semibold">Visible only on mobile</span>
              </div>
              <div className="p-3 bg-green-100 rounded hidden tablet:block desktop:hidden">
                <span className="text-green-800 font-semibold">Visible only on tablet</span>
              </div>
              <div className="p-3 bg-purple-100 rounded hidden desktop:block">
                <span className="text-purple-800 font-semibold">Visible only on desktop</span>
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <span className="text-gray-800 font-semibold">Visible on all breakpoints</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Browser DevTools Testing:</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open DevTools (F12 or Ctrl+Shift+I)</li>
                  <li>Toggle device toolbar (Ctrl+Shift+M)</li>
                  <li>Select different device presets or enter custom dimensions</li>
                  <li>Observe layout changes at each breakpoint</li>
                </ol>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Recommended Test Sizes:</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>320px - iPhone SE (smallest mobile)</li>
                  <li>375px - iPhone 12/13 (common mobile)</li>
                  <li>768px - iPad Portrait (tablet breakpoint)</li>
                  <li>1024px - iPad Landscape (desktop breakpoint)</li>
                  <li>1280px - Desktop (wide breakpoint)</li>
                  <li>1920px - Large Desktop</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">What to Check:</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>✅ All text is readable (no truncation)</li>
                  <li>✅ No horizontal scrolling</li>
                  <li>✅ Buttons are touch-friendly (44x44px minimum)</li>
                  <li>✅ Grid columns adapt correctly</li>
                  <li>✅ Vietnamese diacritics display properly</li>
                  <li>✅ Spacing feels appropriate at each size</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
          >
            ← Back to Game
          </Button>
        </div>
      </div>
    </MenuLayout>
  );
}
