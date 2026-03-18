export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-brand-plum text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-lg font-bold text-white">달콤한 순간</h3>
            <p className="text-sm leading-relaxed">
              정성스러운 수제 디저트로
              <br />
              특별한 순간을 만들어드립니다.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-white">고객센터</h4>
            <p className="text-sm">평일 10:00 - 18:00</p>
            <p className="text-sm">점심 12:00 - 13:00</p>
            <p className="mt-1 text-sm">sinhojung99@gmail.com</p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-white">사업자 정보</h4>
            <p className="text-sm">상호: 달콤한 순간</p>
            <p className="text-sm">대표: TEST</p>
            <p className="text-sm">사업자등록번호: 000-00-00000</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-4 text-center text-xs text-white/50">
          &copy; {new Date().getFullYear()} 달콤한 순간. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
