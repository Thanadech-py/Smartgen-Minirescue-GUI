import sys
import time
from PyQt5.QtCore import QThread, pyqtSignal, QObject, QTimer
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget

class WorkerThread(QThread):
    finished_signal = pyqtSignal()

    def run(self):
        # Your function to be executed in the thread
        self.do_work()
        self.finished_signal.emit()

    def do_work(self):
        # Simulate some time-consuming work
        for i in range(5):
            print(f"Working... {i+1}/5")
            time.sleep(1)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("QThread Example")
        self.setGeometry(100, 100, 400, 200)

        self.central_widget = QWidget(self)
        self.setCentralWidget(self.central_widget)

        self.layout = QVBoxLayout(self.central_widget)

        self.start_button = QPushButton("Start Thread", self)
        self.start_button.clicked.connect(self.start_thread)
        self.layout.addWidget(self.start_button)

    def start_thread(self):
        self.worker_thread = WorkerThread()
        self.worker_thread.finished_signal.connect(self.thread_finished)
        self.worker_thread.start()

    def thread_finished(self):
        print("Thread finished.")
        self.worker_thread.quit()
        self.worker_thread.wait()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
