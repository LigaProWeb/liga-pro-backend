import { Test, TestingModule } from '@nestjs/testing';
import { MatchesServiceController } from './matches-service.controller';
import { MatchesServiceService } from './matches-service.service';

//TEST UNITARIOS: pruebas para lógica de negocio y controladores, con dependencias simuladas
describe('MatchesServiceController', () => {
  let matchesServiceController: MatchesServiceController;

  //CONFIGURACIÓN DE PRUEBAS: creación de módulo de pruebas con controladores y servicios, simulando dependencias
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MatchesServiceController],
      providers: [
        {
          provide: MatchesServiceService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    matchesServiceController = app.get<MatchesServiceController>(
      MatchesServiceController,
    );
  });

  //PRUEBAS: pruebas para cada método del controlador, verificando comportamiento esperado
  describe('root', () => {
    it('should start with no matches', async () => {
      await expect(matchesServiceController.findAll()).resolves.toEqual([]);
    });
  });
});
