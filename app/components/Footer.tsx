// components/Footer.tsx
export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="text-center">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} MSC Classification Application. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }